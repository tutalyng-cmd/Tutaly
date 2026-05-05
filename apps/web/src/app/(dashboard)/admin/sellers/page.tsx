'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function AdminSellersPage() {
  const router = useRouter();
  
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
      setIsUpdating(true);
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/shop/admin/seller/${id}`, { status });
      // Refresh list
      await fetchSellers();
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
      console.error('Update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && sellers.length === 0) {
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
                      onClick={() => setSelectedApp(app)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md inline-flex items-center mr-2"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'approved')}
                      disabled={isUpdating}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md inline-flex items-center mr-2 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md inline-flex items-center disabled:opacity-50"
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

      {/* View Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Applicant Email</h3>
                <p className="mt-1 text-base text-gray-900">{selectedApp.user?.email || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category Focus</h3>
                <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {selectedApp.categoryFocus}
                </span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date Submitted</h3>
                <p className="mt-1 text-base text-gray-900">{new Date(selectedApp.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Bio & Experience</h3>
                <div className="mt-1 text-base text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {selectedApp.bio}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
              <button
                onClick={() => {
                  handleUpdateStatus(selectedApp.id, 'rejected');
                }}
                disabled={isUpdating}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedApp.id, 'approved');
                }}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                Approve Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

