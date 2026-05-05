'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function AdminOrdersPage() {
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/orders/flagged');
      setOrders(res.data.items || []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.message || 'Error loading flagged orders');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, resolution: 'completed' | 'refunded') => {
    const note = prompt(`Enter optional admin notes for resolving as ${resolution}:`);
    if (note === null) return; // User cancelled

    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/orders/${id}/resolve`, { resolution, adminNotes: note });
      // Refresh list
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Flagged Orders</h1>
        <p className="text-gray-500 mt-1">Resolve issues reported by buyers within the escrow window</p>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No flagged orders require review. All clear!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{order.product?.title || 'Unknown Product'}</div>
                    <div className="text-xs text-gray-500">ID: {order.id.slice(0,8)}...</div>
                    <div className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> Flagged
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900"><span className="font-medium text-gray-500">B:</span> {order.buyer?.email || 'N/A'}</div>
                    <div className="text-sm text-gray-900"><span className="font-medium text-gray-500">S:</span> {order.seller?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {order.currency} {order.amountPaid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleResolve(order.id, 'completed')}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md inline-flex items-center mr-2 mb-1 sm:mb-0"
                      title="Release funds to seller"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Release
                    </button>
                    <button
                      onClick={() => handleResolve(order.id, 'refunded')}
                      className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1 rounded-md inline-flex items-center"
                      title="Refund funds to buyer"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
