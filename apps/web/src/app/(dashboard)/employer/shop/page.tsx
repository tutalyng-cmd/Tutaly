'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import {
  Package, Plus, ShoppingBag, TrendingUp, Clock,
  CheckCircle2, Loader2, AlertCircle, Store,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Awaiting Payment', color: 'tag--gold' },
  paid: { label: 'Paid', color: 'tag--blue' },
  delivered: { label: 'Delivered', color: 'tag--blue' },
  completed: { label: 'Completed', color: 'tag--green' },
  flagged: { label: 'Flagged (Review)', color: 'tag' }, // can add tag--red if needed
  refunded: { label: 'Refunded', color: 'tag' },
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
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
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
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
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
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-green" />
      </div>
    );
  }

  // Not a seller yet — show application form
  if (sellerStatus === 'none' || sellerStatus === 'rejected') {
    return (
      <div className="max-w-2xl">
        <div className="dcard mb-6">
          <div className="dcard__header">
            <div>
              <h1 className="dcard__title">Become a Seller</h1>
              <p className="dcard__sub">Apply to sell templates, tools, and services on the Tutaly marketplace.</p>
            </div>
          </div>
        </div>

        {sellerStatus === 'rejected' && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: 'var(--red-10)', border: '1px solid var(--red)', color: 'var(--red)' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">Your previous application was not approved. You may apply again with updated information.</p>
          </div>
        )}

        <form onSubmit={handleApply} className="dcard space-y-6">
          <div className="form-field">
            <label className="form-label">Why do you want to sell on Tutaly? *</label>
            <textarea
              value={applyForm.bio}
              onChange={(e) => setApplyForm(prev => ({ ...prev, bio: e.target.value }))}
              rows={5}
              className="form-input"
              required
              minLength={20}
              placeholder="Tell us about your expertise and what you plan to offer (min 20 characters)..."
            />
          </div>
          <div className="form-field">
            <label className="form-label">Category Focus *</label>
            <input
              type="text"
              value={applyForm.categoryFocus}
              onChange={(e) => setApplyForm(prev => ({ ...prev, categoryFocus: e.target.value }))}
              className="form-input"
              required
              placeholder="e.g. CV Templates, Design Services, Software Tools"
            />
          </div>
          <button
            type="submit"
            disabled={applyLoading}
            className="btn btn--primary"
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
      <div className="max-w-2xl">
        <div className="dcard text-center py-12">
          <Clock className="w-16 h-16 mx-auto mb-6 opacity-80" style={{ color: 'var(--gold)' }} />
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--c-100)' }}>Application Under Review</h2>
          <p className="max-w-md mx-auto" style={{ color: 'var(--c-400)', fontSize: '14px' }}>
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
    <div>
      <div className="dcard mb-6" style={{ background: 'linear-gradient(135deg, var(--green-10), transparent)', borderColor: 'var(--c-700)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '4px' }}>Seller Dashboard</h1>
            <p style={{ fontSize: '13px', color: 'var(--c-400)' }}>Manage your listings and fulfil orders.</p>
          </div>
          <Link
            href="/employer/shop/create"
            className="btn btn--primary btn--sm"
          >
            <Plus className="w-4 h-4" /> New Listing
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-8">
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: 'var(--green-light)' }} /> Active Listings
          </div>
          <p className="stat-card__value">{products.filter(p => p.isActive).length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--gold-h)' }} /> Pending Orders
          </div>
          <p className="stat-card__value">{pendingOrders}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--blue-l)' }} /> Total Earnings
          </div>
          <p className="stat-card__value">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-10">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '16px' }}>Recent Orders</h2>
        {orders.length === 0 ? (
          <div className="dcard text-center" style={{ padding: '32px', color: 'var(--c-400)' }}>
            No orders yet. List a product to start selling!
          </div>
        ) : (
          <div className="dcard p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--c-800)', borderBottom: '1px solid var(--c-700)', color: 'var(--c-400)' }}>
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Your Earning</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-c700">
                  {orders.slice(0, 10).map((order: any) => {
                    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending_payment;
                    return (
                      <tr key={order.id} className="hover:bg-c800 transition-colors">
                        <td className="p-4 font-bold max-w-layout-sm truncate" style={{ color: 'var(--c-100)' }}>{order.product?.title}</td>
                        <td className="p-4 text-sm" style={{ color: 'var(--c-400)' }}>{order.buyer?.email}</td>
                        <td className="p-4 text-sm font-medium" style={{ color: 'var(--c-100)' }}>{formatPrice(order.amountPaid, order.currency)}</td>
                        <td className="p-4 text-sm font-bold text-green">{formatPrice(order.sellerEarnings, order.currency)}</td>
                        <td className="p-4">
                          <span className={`${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.status === 'paid' && (
                            <button
                              onClick={() => handleMarkDelivered(order.id)}
                              disabled={deliveringId === order.id}
                              className="text-sm font-medium text-green hover:text-green flex items-center gap-1"
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
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '16px' }}>Your Listings</h2>
        {products.length === 0 ? (
          <div className="dcard text-center" style={{ padding: '32px', color: 'var(--c-400)' }}>
            No listings yet. Create your first product!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product: any) => (
              <div key={product.id} className="dcard p-5" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="font-bold mb-1 line-clamp-1" style={{ color: 'var(--c-100)' }}>{product.title}</h3>
                <p className="text-sm capitalize mb-4" style={{ color: 'var(--c-400)' }}>{product.listingType}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-green">
                    {product.pricingType === 'per_unit' ? formatPrice(product.price, product.currency) : 'Quote'}
                  </span>
                  <span className={product.isActive ? 'tag tag--green' : 'tag'}>
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
