'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Loader2, DollarSign, ArrowUpRight, TrendingUp, Building } from 'lucide-react';

export default function SellerEarningsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amountPaid || 0), 0);
  const clearedRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amountPaid || 0), 0);
  const pendingClearance = orders.filter(o => ['paid', 'delivered'].includes(o.status)).reduce((sum, o) => sum + Number(o.amountPaid || 0), 0);

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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-100)' }}>Earnings & Payouts</h1>
          <p className="text-sm" style={{ color: 'var(--c-500)' }}>Manage your revenue and request withdrawals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn--primary">
            <Building className="w-4 h-4 mr-2" /> Request Payout
          </button>
        </div>
      </div>

      <div className="stat-grid mb-8">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--green-10), var(--green-10))', borderColor: 'var(--green)' }}>
          <div className="flex justify-between items-start mb-2">
            <div className="stat-card__label" style={{ color: 'var(--c-300)' }}>Available to Withdraw</div>
            <div className="p-2 rounded-full" style={{ background: 'var(--green-10)', color: 'var(--green)' }}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-card__value" style={{ color: 'var(--green)', fontSize: '32px' }}>{formatPrice(clearedRevenue)}</div>
          <div className="stat-card__delta" style={{ color: 'var(--c-400)' }}>Funds cleared from completed orders</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-2">
            <div className="stat-card__label">Pending Clearance</div>
            <div className="p-2 rounded-full" style={{ background: 'var(--gold-10)', color: 'var(--gold)' }}>
              <Loader2 className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-card__value">{formatPrice(pendingClearance)}</div>
          <div className="stat-card__delta" style={{ color: 'var(--c-400)' }}>Orders not yet marked as completed</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-2">
            <div className="stat-card__label">Total All-Time Revenue</div>
            <div className="p-2 rounded-full" style={{ background: 'var(--blue-10)', color: 'var(--blue-l)' }}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-card__value">{formatPrice(totalRevenue)}</div>
          <div className="stat-card__delta" style={{ color: 'var(--c-400)' }}>Gross sales before fees</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="dcard">
            <div className="dcard__header border-b border-c700 pb-4 mb-4">
              <div>
                <div className="dcard__title">Recent Transactions</div>
                <div className="dcard__sub">Latest sales and payouts</div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="dash-empty py-10">
                <div className="dash-empty__title text-c500">No transactions yet</div>
              </div>
            ) : (
              <div className="space-y-1">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-c700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--green-10)', color: 'var(--green)' }}>
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--c-100)' }}>Sale: {order.product?.title || 'Product'}</div>
                        <div className="text-xs" style={{ color: 'var(--c-500)' }}>{new Date(order.createdAt).toLocaleString()} · Order #{order.id.slice(0, 8)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold" style={{ color: 'var(--green)' }}>+{formatPrice(order.amountPaid || order.total, order.currency)}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: order.status === 'completed' ? 'var(--green)' : 'var(--gold)' }}>
                        {order.status === 'completed' ? 'Cleared' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {orders.length > 0 && (
              <div className="mt-4 pt-4 border-t border-c700 text-center">
                <button className="text-sm font-semibold text-c400 hover:text-c200">Load More Transactions</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="dcard mb-6">
            <div className="dcard__header mb-4">
              <div className="dcard__title">Payout Methods</div>
            </div>
            
            <div className="p-4 rounded-xl border border-c600 mb-4" style={{ background: 'var(--c-700)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold" style={{ color: 'var(--c-100)' }}>Bank Transfer</div>
                <span className="text-xs font-bold uppercase px-2 py-1 rounded-md" style={{ background: 'var(--green-10)', color: 'var(--green)' }}>Default</span>
              </div>
              <div className="text-sm" style={{ color: 'var(--c-400)' }}>GTBank •••• 4092</div>
              <div className="text-xs mt-1" style={{ color: 'var(--c-500)' }}>Chukwudi O.</div>
            </div>
            
            <button className="w-full py-3 rounded-lg border border-dashed text-sm font-semibold transition-colors" style={{ borderColor: 'var(--c-500)', color: 'var(--c-300)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--c-100)'} onMouseOut={e => e.currentTarget.style.color = 'var(--c-300)'}>
              + Add Payout Method
            </button>
          </div>

          <div className="dcard" style={{ background: 'linear-gradient(to bottom, var(--c-800), var(--c-900))' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--c-100)' }}>Need help with payouts?</h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--c-400)' }}>
              Funds from sales are held in escrow until the order is marked as completed by the buyer. Once completed, they are moved to your Available balance.
            </p>
            <Link href="/help" className="text-xs font-semibold hover:underline" style={{ color: 'var(--blue-l)' }}>Read Earnings Guide →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
