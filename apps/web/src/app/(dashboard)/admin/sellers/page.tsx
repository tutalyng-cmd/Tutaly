'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function AdminSellersPage() {
  const router = useRouter();
  
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/shop/admin/seller/pending');
      setSellers(res.data.items || []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.message || 'Error loading seller applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this application?`)) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/shop/admin/seller/${id}`, { status });
      // Refresh list
      fetchSellers();
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
        <h1 className="text-2xl font-bold text-gray-900">Approve Sellers</h1>
        <p className="text-gray-500 mt-1">Review and approve pending seller applications</p>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {sellers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending seller applications require review.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Focus
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{app.user?.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">{app.bio}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {app.categoryFocus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'approved')}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md inline-flex items-center mr-2"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md inline-flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
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
