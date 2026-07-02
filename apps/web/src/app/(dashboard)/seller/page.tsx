'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import {
  Plus, CheckCircle2, Loader2, Clock, Edit2, Archive
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; style?: React.CSSProperties }> = {
  pending_payment: { label: 'Awaiting Payment', color: '', style: { background: 'rgba(201,162,39,0.18)', color: 'var(--gold-h)' } },
  paid: { label: 'Paid', color: '', style: { background: 'rgba(29,122,58,0.18)', color: '#2DB85A' } },
  delivered: { label: 'Delivered', color: '', style: { background: 'rgba(27,79,158,0.18)', color: 'var(--blue-l)' } },
  completed: { label: 'Completed', color: '', style: { background: 'rgba(29,122,58,0.18)', color: '#2DB85A' } },
  flagged: { label: 'Flagged (Review)', color: '', style: { background: 'rgba(204,43,43,0.18)', color: '#F05050' } },
  refunded: { label: 'Refunded', color: '', style: { background: 'rgba(255,255,255,0.1)', color: 'var(--c-500)' } },
};

export default function SellerShopPage() {
  const [sellerStatus, setSellerStatus] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);

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

  const handleMarkDelivered = async (orderId: string) => {
    setDeliveringId(orderId);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/shop/orders/${orderId}/deliver`);
      const t = localStorage.getItem('access_token');
      if (t) await fetchSellerData(t);
    } catch (e) {
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setDeliveringId(null);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--c-500)' }}>
        Loading dashboard...
      </div>
    );
  }

  if (sellerStatus === 'none' || sellerStatus === 'rejected') {
    if (typeof window !== 'undefined') {
      window.location.href = '/seller/apply';
    }
    return null;
  }

  if (sellerStatus === 'pending') {
    return (
      <div className="dash-empty" style={{ marginTop: '40px' }}>
        <div className="dash-empty__icon" style={{ background: 'rgba(201,162,39,0.15)', color: 'var(--gold)' }}><Clock size={28} /></div>
        <div className="dash-empty__title">Application Under Review</div>
        <div className="dash-empty__desc">
          Your seller application is being reviewed by the Tutaly team. You'll be notified once a decision is made.
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + Number(o.sellerEarnings || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'paid').length;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="section__title" style={{ fontSize: '24px', marginBottom: '4px' }}>Seller Dashboard</h1>
          <p className="section__subtitle" style={{ marginBottom: 0 }}>Manage your listings and fulfil orders.</p>
        </div>
        <Link href="/seller/create" className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Active Listings</div>
          <div className="stat-card__value">{products.filter(p => p.isActive).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Pending Orders</div>
          <div className="stat-card__value">{pendingOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Earnings</div>
          <div className="stat-card__value" style={{ color: '#2DB85A' }}>{formatPrice(totalRevenue)}</div>
        </div>
      </div>

      <div className="overview-grid">
        
        {/* Recent Orders Col */}
        <div className="dcard">
          <div className="dcard__header">
            <div>
              <div className="dcard__title">Recent Orders</div>
              <div className="dcard__sub">Latest purchases from buyers</div>
            </div>
            <Link href="/seller/orders" style={{ fontSize: '13px', color: 'var(--blue-l)', fontWeight: 600 }}>View all</Link>
          </div>

          {orders.length === 0 ? (
            <div className="dash-empty" style={{ padding: '40px 20px' }}>
              <div className="dash-empty__title" style={{ color: 'var(--c-500)' }}>No orders yet</div>
            </div>
          ) : (
            <div>
              {orders.slice(0, 5).map((order: any) => {
                const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending_payment;
                return (
                  <div key={order.id} className="order-row">
                    <div className="order-row__thumb" style={{ background: 'rgba(27,79,158,0.15)' }}>📄</div>
                    <div className="order-row__body">
                      <div className="order-row__title">{order.product?.title || 'Unknown Product'}</div>
                      <div className="order-row__meta">
                        Purchased by {order.buyer?.firstName || order.buyer?.email} · {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="order-row__status">
                      <span style={{ padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', ...statusInfo.style }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="order-row__price">{formatPrice(order.amountPaid, order.currency)}</div>
                    
                    {order.status === 'paid' && (
                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        disabled={deliveringId === order.id}
                        className="btn btn--sm"
                        style={{ marginLeft: '12px', background: 'rgba(29,122,58,0.15)', color: '#2DB85A', borderColor: 'transparent' }}
                      >
                        {deliveringId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Delivered'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Listings Col */}
        <div className="dcard">
          <div className="dcard__header">
            <div>
              <div className="dcard__title">Your Listings</div>
              <div className="dcard__sub">Manage products</div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="dash-empty" style={{ padding: '40px 20px' }}>
              <div className="dash-empty__title" style={{ color: 'var(--c-500)' }}>No listings yet</div>
            </div>
          ) : (
            <div>
              {products.map((product: any) => (
                <div key={product.id} className="listing-row">
                  <div className="listing-row__thumb" style={{ background: 'rgba(201,162,39,0.12)' }}>🎓</div>
                  <div className="listing-row__body">
                    <div className="listing-row__title">{product.title}</div>
                    <div className="listing-row__meta">
                      Published {new Date(product.createdAt).toLocaleDateString()} · {product.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="listing-row__sales">
                    <div className="listing-row__sales-num">{product.salesCount || 0}</div>
                    <div className="listing-row__sales-label">Sold</div>
                  </div>
                  <div className="listing-row__price">{formatPrice(product.price, product.currency)}</div>
                  <div className="listing-row__actions">
                    <button className="dash-icon-btn" title="Edit Listing"><Edit2 className="w-4 h-4" /></button>
                    <button className="dash-icon-btn" title="Archive"><Archive className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
