'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, CreditCard, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiAuth } from '@/lib/api';

interface RevenueSummary {
  grossRevenue: number;
  totalCommission: number;
  totalSellerPayables: number;
  totalOrders: number;
  byGateway: Array<{
    gateway: string;
    grossRevenue: number;
    commission: number;
    orderCount: number;
  }>;
}

interface Transaction {
  id: string;
  buyerEmail: string;
  productTitle: string;
  amountPaid: number;
  commissionAmount: number;
  sellerEarnings: number;
  currency: string;
  paymentGateway: string;
  paymentRef: string;
  status: string;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminRevenuePage() {
  const router = useRouter();

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthenticated');

      const [summaryRes, transRes, chartRes] = await Promise.all([
        apiAuth.withToken(token).get('/admin/revenue'),
        apiAuth.withToken(token).get('/admin/revenue/transactions', { params: { page, limit: 10 } }),
        apiAuth.withToken(token).get('/admin/revenue/summary', { params: { period: 'monthly' } }),
      ]);

      setSummary(summaryRes.data);
      setTransactions(transRes.data.items || []);
      setMeta(transRes.data.meta || null);
      
      // Format chart data (assume data has period string, format to month name)
      if (chartRes.data && chartRes.data.data) {
        const formatted = chartRes.data.data.map((d: any) => {
          const date = new Date(d.period);
          return {
            name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            Gross: d.grossRevenue,
            Commission: d.commission,
          };
        });
        setChartData(formatted);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading revenue data');
    } finally {
      setLoading(false);
    }
  }, [page, router]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const formatCurrency = (val: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 uppercase">{status}</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 uppercase">{status}</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Revenue & Analytics</h1>
        <p className="text-gray-500 mt-1">Monitor platform revenue, commissions, and transactions.</p>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg text-sm">{error}</div>}

      {loading && !summary ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      ) : summary ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
              <div className="bg-teal-50 p-4 rounded-2xl mr-4">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Gross Revenue</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(summary.grossRevenue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
              <div className="bg-blue-50 p-4 rounded-2xl mr-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Total Commission</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(summary.totalCommission)}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
              <div className="bg-purple-50 p-4 rounded-2xl mr-4">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Seller Payables</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(summary.totalSellerPayables)}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
              <div className="bg-orange-50 p-4 rounded-2xl mr-4">
                <ShoppingBag className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Total Orders</p>
                <p className="text-2xl font-black text-gray-900">{summary.totalOrders}</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Revenue Overview</h2>
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Gross" fill="#0D1B2A" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="Commission" fill="#1D9E75" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No chart data available</div>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Gateway</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Commission</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.buyerEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                        {tx.productTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {tx.paymentGateway}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(tx.amountPaid, tx.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 font-medium">
                        {formatCurrency(tx.commissionAmount, tx.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusBadge(tx.status)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages} ({meta.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= meta.totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 disabled:opacity-40 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
