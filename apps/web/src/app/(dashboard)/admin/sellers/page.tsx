'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Users, Clock, ShieldCheck, Ban } from 'lucide-react';
import { apiAuth } from '@/lib/api';

type TabStatus = 'pending' | 'approved' | 'rejected' | 'all';

const TABS: { key: TabStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { key: 'approved', label: 'Approved', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'rejected', label: 'Rejected', icon: <Ban className="w-4 h-4" /> },
  { key: 'all', label: 'All', icon: <Users className="w-4 h-4" /> },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
};

export default function AdminSellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabStatus>('pending');

  useEffect(() => {
    fetchSellers();
  }, [activeTab]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');

      let url: string;
      if (activeTab === 'all') {
        url = '/admin/sellers';
      } else {
        url = `/admin/sellers?status=${activeTab}`;
      }

      const res = await apiAuth.withToken(token || undefined).get(url);
      const payload = res.data;
      const extracted = payload.items || payload.data?.items || (Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : []));
      setSellers(extracted);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading seller applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this application?`)) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/sellers/${id}/status`, { status });
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

  const badge = (status: string) => {
    const b = STATUS_BADGES[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
    return (
      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Manage Sellers</h1>
        <p className="text-gray-500 mt-1">Review, approve, and manage all seller applications.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-gray-600 border border-gray-100 hover:border-teal-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 bg-red-50 p-3 sm:p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : sellers.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No applications found</h3>
            <p className="text-gray-500">
            {activeTab === 'pending'
              ? 'No pending seller applications require review.'
              : activeTab === 'approved'
              ? 'No approved sellers found.'
              : activeTab === 'rejected'
              ? 'No rejected applications.'
              : 'No seller applications found.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">User Details</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Category Focus</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{app.user?.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{app.bio}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {app.categoryFocus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{badge(app.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedApp(app)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                            <Eye className="h-4 w-4 mr-1" />View
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(app.id, 'approved')} disabled={isUpdating} className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors disabled:opacity-50">
                                <CheckCircle className="h-4 w-4 mr-1" />Approve
                              </button>
                              <button onClick={() => handleUpdateStatus(app.id, 'rejected')} disabled={isUpdating} className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors disabled:opacity-50">
                                <XCircle className="h-4 w-4 mr-1" />Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {sellers.map((app) => (
                <div key={app.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{app.user?.email || 'N/A'}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{app.bio}</p>
                    </div>
                    {badge(app.status)}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {app.categoryFocus}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedApp(app)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium">
                      <Eye className="h-3.5 w-3.5 mr-1" />View
                    </button>
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(app.id, 'approved')} disabled={isUpdating} className="text-green-600 bg-green-50 px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium disabled:opacity-50">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                        </button>
                        <button onClick={() => handleUpdateStatus(app.id, 'rejected')} disabled={isUpdating} className="text-red-600 bg-red-50 px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium disabled:opacity-50">
                          <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Details Modal — bottom sheet on mobile */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Application Details</h2>
                {badge(selectedApp.status)}
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Applicant Email</h3>
                <p className="mt-0.5 text-sm sm:text-base text-gray-900 break-all">{selectedApp.user?.email || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Category Focus</h3>
                <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {selectedApp.categoryFocus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Date Submitted</h3>
                  <p className="mt-0.5 text-sm text-gray-900">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                </div>
                {selectedApp.reviewedBy && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Reviewed By</h3>
                    <p className="mt-0.5 text-sm text-gray-900">{selectedApp.reviewedBy?.email || 'Admin'}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">Bio & Experience</h3>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 sm:p-4 rounded-lg whitespace-pre-wrap max-h-48 sm:max-h-64 overflow-y-auto">
                  {selectedApp.bio}
                </div>
              </div>
            </div>

            {selectedApp.status === 'pending' && (
              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 pt-6">
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                  disabled={isUpdating}
                  className="px-6 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-bold disabled:opacity-50 w-full sm:w-auto transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                  disabled={isUpdating}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 font-bold disabled:opacity-50 w-full sm:w-auto transition-colors"
                >
                  Approve Application
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
