'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Loader2, Package, CheckCircle, Search, Download } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; class: string; icon: string }> = {
  pending_payment: { label: 'Awaiting Payment', class: 'status--pending', icon: '⏳' },
  paid: { label: 'Paid - Needs Delivery', class: 'status--offer', icon: '📦' },
  delivered: { label: 'Delivered', class: 'status--offer', icon: '🚚' },
  completed: { label: 'Completed', class: 'status--offer', icon: '✅' },
  flagged: { label: 'Flagged', class: 'status--con', icon: '🚩' },
  refunded: { label: 'Refunded', class: 'status--muted', icon: '↩️' },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await apiAuth.withToken(token).get('/shop/seller/orders');
      setOrders(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/shop/orders/${orderId}/deliver`);
      await fetchOrders();
    } catch (e) {
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to mark as delivered');
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const title = o.product?.title?.toLowerCase() || '';
      const buyerName = o.buyer?.firstName?.toLowerCase() || o.buyer?.lastName?.toLowerCase() || '';
      const buyerEmail = o.buyer?.email?.toLowerCase() || '';
      return title.includes(search) || buyerName.includes(search) || buyerEmail.includes(search);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="dash-empty mt-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" style={{ borderBottom: 'none', padding: '0 0 10px 0' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-100)' }}>Orders Management</h1>
          <p className="text-sm" style={{ color: 'var(--c-500)' }}>Track and fulfill purchases from your buyers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller/earnings" className="btn btn--ghost">View Earnings</Link>
          <button className="btn btn--primary">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="dcard mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-c500" style={{ color: 'var(--c-500)' }} />
            <input 
              type="text" 
              placeholder="Search by buyer name, email, or product..." 
              className="input pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input sm:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Needs Delivery (Paid)</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="dcard">
        {filteredOrders.length === 0 ? (
          <div className="dash-empty py-16">
            <div className="dash-empty__icon" style={{ background: 'var(--c-700)' }}>📦</div>
            <div className="dash-empty__title text-c100">No orders found</div>
            <div className="dash-empty__desc text-c500">
              {searchTerm || statusFilter !== 'all' 
                ? "No orders match your search criteria." 
                : "When customers buy your listings, their orders will appear here."}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending_payment;
              return (
                <div key={order.id} className="order-row">
                  <div className="order-row__thumb" style={{ background: 'var(--blue-10)' }}>{statusInfo.icon}</div>
                  
                  <div className="order-row__body">
                    <div className="order-row__title">{order.product?.title || 'Unknown Product'}</div>
                    <div className="order-row__meta mt-1">
                      <span className="font-semibold" style={{ color: 'var(--c-300)' }}>Buyer:</span> {order.buyer?.firstName} {order.buyer?.lastName} ({order.buyer?.email || 'Guest'})
                    </div>
                    <div className="order-row__meta">
                      <span className="font-semibold" style={{ color: 'var(--c-300)' }}>Order ID:</span> #{order.id.slice(0, 8)} · {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="order-row__price mx-4 text-left">
                    <div style={{ color: 'var(--c-100)', fontWeight: 700, fontSize: '15px' }}>{formatPrice(order.amountPaid || order.total, order.currency)}</div>
                    <div style={{ color: 'var(--c-500)', fontSize: '11px', fontWeight: 500 }}>Total Paid</div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0 w-40 text-right">
                    <span style={{ 
                      background: order.status === 'paid' ? 'var(--gold-10)' : 'var(--green-10)', 
                      color: order.status === 'paid' ? 'var(--gold)' : 'var(--green)', 
                      padding: '4px 10px', 
                      borderRadius: 'var(--r-pill)', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase' 
                    }}>
                      {statusInfo.label}
                    </span>
                    
                    {order.status === 'paid' && (
                      <button 
                        onClick={() => handleMarkDelivered(order.id)}
                        className="btn btn--sm"
                        style={{ background: 'var(--c-700)', color: 'var(--c-100)', padding: '6px 12px' }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
