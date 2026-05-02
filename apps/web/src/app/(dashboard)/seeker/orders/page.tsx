'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import {
  Package, Download, CheckCircle2, Clock, ShieldCheck,
  AlertCircle, Loader2, ExternalLink,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  paid_escrow: { label: 'In Escrow', color: 'bg-blue-100 text-blue-700', icon: ShieldCheck },
  delivered: { label: 'Delivered', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  auto_complete: { label: 'Auto-completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/shop/orders');
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (orderId: string) => {
    setDownloading(orderId);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/shop/orders/${orderId}/download`);
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    if (!confirm('Confirm you have received your order? This will release funds to the seller.')) return;
    setConfirming(orderId);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/shop/orders/${orderId}/confirm-delivery`);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setConfirming(null);
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

  return (
    <div className="p-8 pb-16 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">Track your purchases and download digital products.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Visit the shop to find tools and resources.</p>
          <Link href="/shop" className="text-teal-600 font-medium hover:text-teal-700">
            Browse Shop →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending_payment;
            const StatusIcon = statusInfo.icon;

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.product?.title || 'Product'}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{order.paymentRef}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`${statusInfo.color} px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {statusInfo.label}
                    </span>
                    <span className="font-bold text-teal-700 text-lg">{formatPrice(order.amountPaid, order.currency)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {/* Download for digital */}
                  {order.product?.fileS3Key && ['paid_escrow', 'delivered', 'complete', 'auto_complete'].includes(order.status) && (
                    <button
                      onClick={() => handleDownload(order.id)}
                      disabled={downloading === order.id}
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {downloading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download
                    </button>
                  )}

                  {/* Confirm delivery */}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={confirming === order.id}
                      className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {confirming === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirm Delivery
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
