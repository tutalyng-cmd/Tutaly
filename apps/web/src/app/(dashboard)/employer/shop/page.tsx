'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import {
  Package, Plus, ShoppingBag, TrendingUp, Clock,
  CheckCircle2, Loader2, AlertCircle, Store,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Delivered', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  flagged: { label: 'Flagged (Review)', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

export default function SellerShopPage() {
  const [sellerStatus, setSellerStatus] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [applyForm, setApplyForm] = useState({ bio: '', categoryFocus: '' });

  useEffect(() => {
    checkSellerStatus();
  }, []);

  const checkSellerStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await apiAuth.withToken(token).get('/shop/seller/status');
      const status = res.data?.sellerStatus || 'none';
      setSellerStatus(status);

      if (status === 'approved') {
        await fetchSellerData(token);
      }
    } catch (err) {
      console.error('Failed to check seller status', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerData = async (token: string) => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        apiAuth.withToken(token).get('/shop/seller/products'),
        apiAuth.withToken(token).get('/shop/seller/orders'),
      ]);
      setProducts(productsRes.data?.data || []);
      setOrders(ordersRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch seller data', err);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post('/shop/seller/apply', applyForm);
      setSellerStatus('pending');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Application failed');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setDeliveringId(orderId);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/shop/orders/${orderId}/deliver`);
      const t = localStorage.getItem('access_token');
      if (t) await fetchSellerData(t);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setDeliveringId(null);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur }).format(price);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  // Not a seller yet — show application form
  if (sellerStatus === 'none' || sellerStatus === 'rejected') {
    return (
      <div className="p-8 pb-16 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Become a Seller</h1>
          <p className="text-gray-500 mt-1">Apply to sell templates, tools, and services on the Tutaly marketplace.</p>
        </div>

        {sellerStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Your previous application was not approved. You may apply again with updated information.
          </div>
        )}

        <form onSubmit={handleApply} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to sell on Tutaly? *</label>
            <textarea
              value={applyForm.bio}
              onChange={(e) => setApplyForm(prev => ({ ...prev, bio: e.target.value }))}
              rows={5}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              required
              minLength={20}
              placeholder="Tell us about your expertise and what you plan to offer (min 20 characters)..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Focus *</label>
            <input
              type="text"
              value={applyForm.categoryFocus}
              onChange={(e) => setApplyForm(prev => ({ ...prev, categoryFocus: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              required
              placeholder="e.g. CV Templates, Design Services, Software Tools"
            />
          </div>
          <button
            type="submit"
            disabled={applyLoading}
            className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {applyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
            Submit Application
          </button>
        </form>
      </div>
    );
  }

  // Application pending
  if (sellerStatus === 'pending') {
    return (
      <div className="p-8 pb-16 max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Under Review</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Your seller application is being reviewed by the Tutaly team. You'll be notified once a decision is made.
          </p>
        </div>
      </div>
    );
  }

  // Approved seller — show dashboard
  const totalRevenue = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + Number(o.sellerEarnings || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'paid').length;

  return (
    <div className="p-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your listings and fulfil orders.</p>
        </div>
        <Link
          href="/employer/shop/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" /> New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-50 p-2 rounded-lg"><ShoppingBag className="w-5 h-5 text-teal-600" /></div>
            <span className="text-sm font-medium text-gray-500">Active Listings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <span className="text-sm font-medium text-gray-500">Pending Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <span className="text-sm font-medium text-gray-500">Total Earnings</span>
          </div>
          <p className="text-2xl font-bold text-teal-700">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            No orders yet. List a product to start selling!
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Your Earning</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 10).map((order: any) => {
                    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending_payment;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900 max-w-[200px] truncate">{order.product?.title}</td>
                        <td className="p-4 text-sm text-gray-500">{order.buyer?.email}</td>
                        <td className="p-4 text-sm font-medium">{formatPrice(order.amountPaid, order.currency)}</td>
                        <td className="p-4 text-sm font-bold text-teal-700">{formatPrice(order.sellerEarnings, order.currency)}</td>
                        <td className="p-4">
                          <span className={`${statusInfo.color} px-2 py-1 rounded-md text-xs font-bold`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.status === 'paid' && (
                            <button
                              onClick={() => handleMarkDelivered(order.id)}
                              disabled={deliveringId === order.id}
                              className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
                            >
                              {deliveringId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Mark Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Listings</h2>
        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            No listings yet. Create your first product!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                <p className="text-sm text-gray-500 capitalize mb-2">{product.listingType}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-700">
                    {product.pricingType === 'per_unit' ? formatPrice(product.price, product.currency) : 'Quote'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
