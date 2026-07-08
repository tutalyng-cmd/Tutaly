'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending_payment: { label: 'Awaiting Payment', class: 'status--pending' },
  paid: { label: 'Paid', class: 'status--offer' }, // using a green badge style
  delivered: { label: 'Delivered', class: 'status--offer' },
  completed: { label: 'Completed', class: 'status--offer' },
  flagged: { label: 'Flagged', class: 'status--con' },
  refunded: { label: 'Refunded', class: 'status--muted' },
};

export default function SellerShopPage() {
  const [sellerStatus, setSellerStatus] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setProducts(productsRes.data?.data || productsRes.data || []);
      setOrders(ordersRes.data?.data || ordersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch seller data', err);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="dash-empty mt-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green" />
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
      <div className="dash-empty mt-10">
        <div className="dash-empty__icon" style={{ background: 'var(--c-700)' }}>⏳</div>
        <div className="dash-empty__title">Application Under Review</div>
        <div className="dash-empty__desc">
          Your seller application is being reviewed by the Tutaly team. You'll be notified once a decision is made.
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + Number(o.amountPaid || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'paid').length;
  const activeListings = products.filter((p: any) => p.isActive).length;

  return (
    <>
      <div className="dcard" style={{ background: 'linear-gradient(135deg, var(--green-10), var(--gold-10))', borderColor: 'var(--c-700)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '4px' }}>Your Seller Dashboard</div>
            <div style={{ fontSize: '13px', color: 'var(--c-400)' }}>Sell resume templates, courses, and guides to the Tutaly community.</div>
          </div>
          <Link href="/seller/create" className="btn btn--primary btn--sm">+ New listing</Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total earnings</div>
          <div className="stat-card__value" style={{ color: 'var(--green)' }}>{formatPrice(totalRevenue)}</div>
          <div className="stat-card__delta up">↑ All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Available to withdraw</div>
          <div className="stat-card__value">{formatPrice(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Active listings</div>
          <div className="stat-card__value">{activeListings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total sales</div>
          <div className="stat-card__value">{orders.length}</div>
        </div>
      </div>

      <div className="dcard">
        <div className="dcard__header">
          <div>
            <div className="dcard__title">Your listings</div>
            <div className="dcard__sub">Products currently for sale</div>
          </div>
          <Link href="/seller/products" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--blue-l)' }}>Manage all →</Link>
        </div>

        {products.length === 0 ? (
          <div className="dash-empty py-10">
            <div className="dash-empty__title text-c500">No listings yet</div>
          </div>
        ) : (
          <div>
            {products.map((product: any) => (
              <div key={product.id} className="listing-row">
                <div className="listing-row__thumb" style={{ background: 'var(--blue-10)' }}>{product.listingType === 'digital' ? '📄' : product.listingType === 'service' ? '💼' : '📦'}</div>
                <div className="listing-row__body">
                  <div className="listing-row__title">{product.title}</div>
                  <div className="listing-row__meta">Published {new Date(product.createdAt).toLocaleDateString()} · {product.isActive ? 'Active' : 'Inactive'}</div>
                </div>
                <div className="listing-row__sales">
                  <div className="listing-row__sales-num">{product.salesCount || 0}</div>
                  <div className="listing-row__sales-label">Sold</div>
                </div>
                <div className="listing-row__price">{formatPrice(product.price || 0, product.currency)}</div>
                <div className="listing-row__actions">
                  <button className="btn btn--ghost btn--sm">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dcard mt-4">
        <div className="dcard__header">
          <div>
            <div className="dcard__title">Recent orders received</div>
            <div className="dcard__sub">Latest sales across your listings</div>
          </div>
          <Link href="/seller/orders" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--blue-l)' }}>View all →</Link>
        </div>

        {orders.length === 0 ? (
          <div className="dash-empty py-10">
            <div className="dash-empty__title text-c500">No orders yet</div>
          </div>
        ) : (
          <div>
            {orders.slice(0, 5).map((order: any) => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending_payment;
              return (
                <div key={order.id} className="order-row">
                  <div className="order-row__thumb" style={{ background: 'var(--blue-10)' }}>📄</div>
                  <div className="order-row__body">
                    <div className="order-row__title">{order.product?.title || 'Unknown Product'}</div>
                    <div className="order-row__meta">
                      Purchased by {order.buyer?.firstName || order.buyer?.email || 'Guest'} · {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="order-row__status">
                    <span style={{ background: 'var(--green-10)', color: 'var(--green)', padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="order-row__price">{formatPrice(order.amountPaid || order.total, order.currency)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </>
  );
}
