'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Package, 
  ChevronRight,
} from 'lucide-react';
import { apiAuth } from '@/lib/api';

const ORDER_STATUSES = [
  { label: 'All Orders', value: '' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Paid', value: 'paid' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Refunded', value: 'refunded' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || '';
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<any>(null);

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/orders', {
        params: { status: currentStatus || undefined }
      });
      setOrders(res.data.items || []);
      setMeta(res.data.meta);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleResolve = async (id: string, resolution: 'completed' | 'refunded') => {
    const note = prompt(`Enter optional admin notes for resolving as ${resolution}:`);
    if (note === null) return;

    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/orders/${id}/resolve`, { resolution, adminNotes: note });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Completed</span>;
      case 'paid': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">Paid</span>;
      case 'delivered': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase">Delivered</span>;
      case 'flagged': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">Flagged</span>;
      case 'refunded': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">Refunded</span>;
      case 'pending_payment': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">Pending Payment</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Marketplace Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage all shop transactions and escrow states.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ORDER_STATUSES.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(`/admin/orders?status=${tab.value}`)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              currentStatus === tab.value
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-gray-600 border border-gray-100 hover:border-teal-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500">There are no orders matching the selected status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Product & ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Buyer / Seller</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 line-clamp-1">{order.product?.title || 'Unknown Product'}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-teal-600 w-4">B:</span>
                          <span className="text-gray-600">{order.buyer?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-orange-600 w-4">S:</span>
                          <span className="text-gray-600">{order.seller?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900">{order.currency} {Number(order.amountPaid).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">{order.paymentGateway}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {order.status === 'flagged' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResolve(order.id, 'completed')}
                            className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Release
                          </button>
                          <button
                            onClick={() => handleResolve(order.id, 'refunded')}
                            className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Refund
                          </button>
                        </div>
                      ) : (
                        <button className="text-gray-400 hover:text-teal-600 p-1">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
