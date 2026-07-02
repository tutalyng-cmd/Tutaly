'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import {
  Download, CheckCircle2, AlertCircle, Loader2, Package, ShieldCheck, Clock
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; className: string; icon: any }> = {
  pending_payment: { label: 'Pending Payment', className: 'text-c500 bg-c100', icon: Clock },
  paid: { label: 'Paid', className: 'text-blue-l bg-blue-l', icon: ShieldCheck },
  delivered: { label: 'Delivered', className: 'text-blue-l bg-blue-l', icon: Package },
  completed: { label: 'Completed', className: 'text-green bg-green', icon: CheckCircle2 },
  flagged: { label: 'Flagged (Review)', className: 'text-red bg-red', icon: AlertCircle },
  refunded: { label: 'Refunded', className: 'text-c700 bg-c100', icon: AlertCircle },
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
    } catch (e) {
      const err = e as any;
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
    } catch (e) {
      const err = e as any;
      alert(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setConfirming(null);
    }
  };

  const handleReportIssue = async (orderId: string) => {
    const reason = prompt('Please describe the issue with your order:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/shop/orders/${orderId}/report`, { reason });
      fetchOrders();
    } catch (e) {
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to report issue');
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur }).format(price);
  };

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="section__title" style={{ fontSize: '28px', marginBottom: '8px' }}>My Orders</h1>
        <p className="section__subtitle" style={{ marginBottom: 0 }}>Track your purchases and download digital products.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-500)' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty__icon">🛍️</div>
          <div className="dash-empty__title">No orders yet</div>
          <div className="dash-empty__desc">Visit the shop to find tools and resources.</div>
          <Link href="/shop" className="btn btn--primary">Browse Shop</Link>
        </div>
      ) : (
        <div className="dcard" style={{ padding: '0' }}>
          {orders.map((order: any, idx: number) => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending_payment;
            
            return (
              <div key={order.id} className="order-row" style={{ 
                border: 'none', 
                borderBottom: idx < orders.length - 1 ? '1px solid var(--c-700)' : 'none',
                borderRadius: 0,
                margin: 0,
                padding: '24px'
              }}>
                <div className="order-row__thumb" style={{ background: 'rgba(29,122,58,0.18)', color: '#2DB85A' }}>
                  📦
                </div>
                <div className="order-row__body">
                  <div className="order-row__title">{order.product?.title || 'Product'}</div>
                  <div className="order-row__meta">
                    {order.paymentRef} · {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    <span style={{ marginLeft: '8px', padding: '2px 6px', borderRadius: 'var(--r-sm)', fontSize: '10px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <statusInfo.icon className="w-3 h-3" /> {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div className="order-row__price">{formatPrice(order.amountPaid, order.currency)}</div>
                <div className="order-row__status" style={{ display: 'flex', gap: '8px' }}>
                  {order.product?.fileS3Key && ['paid', 'delivered', 'completed'].includes(order.status) && (
                    <button
                      onClick={() => handleDownload(order.id)}
                      disabled={downloading === order.id}
                      className="btn btn--sm" style={{ background: 'rgba(27,79,158,0.18)', color: 'var(--blue-l)', border: 'none' }}
                    >
                      {downloading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={confirming === order.id}
                      className="btn btn--sm btn--primary"
                    >
                      {confirming === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirm
                    </button>
                  )}
                  {['paid', 'delivered'].includes(order.status) && (
                    <button
                      onClick={() => handleReportIssue(order.id)}
                      className="btn btn--sm btn--danger-outline"
                    >
                      Report Issue
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
