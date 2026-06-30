'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Users, Clock, ShieldCheck, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiAuth } from '@/lib/api';

type TabStatus = 'pending' | 'approved' | 'rejected' | 'all';

const TABS: { key: TabStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { key: 'approved', label: 'Approved', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'rejected', label: 'Rejected', icon: <Ban className="w-4 h-4" /> },
  { key: 'all', label: 'All', icon: <Users className="w-4 h-4" /> },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-gold', text: 'text-goldH', label: 'Pending' },
  approved: { bg: 'bg-green', text: 'text-green', label: 'Approved' },
  rejected: { bg: 'bg-red', text: 'text-red', label: 'Rejected' },
};

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminSellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabStatus>('pending');
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');

      let url: string;
      const params: Record<string, any> = { page, limit: 20 };

      if (activeTab === 'pending') {
        url = '/admin/queue/sellers';
      } else if (activeTab === 'all') {
        url = '/admin/sellers';
      } else {
        // For 'approved' and 'rejected', the backend getActiveSellerApplications
        // only returns approved. So we use queue/sellers or sellers endpoint
        // The controller GET /admin/sellers returns approved sellers
        // For rejected, there's no dedicated endpoint, so we'll use /admin/sellers
        url = '/admin/sellers';
      }

      const res = await apiAuth.withToken(token || undefined).get(url, { params });
      const payload = res.data;
      setSellers(payload.items || []);
      setMeta(payload.meta || null);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading seller applications');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, router]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleUpdateStatus = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;

    const reason = action === 'reject' ? prompt('Enter rejection reason (optional):') : undefined;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/sellers/${id}`, {
        action,
        ...(reason && { reason }),
      });
      await fetchSellers();
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
alert(err.response?.data?.message || err.message);
      console.error('Update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const badge = (status: string) => {
    const b = STATUS_BADGES[status] || { bg: 'bg-c100', text: 'text-c600', label: status };
    return (
      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-c900">Manage Sellers</h1>
          <p className="text-c500 mt-1">Review, approve, and manage all seller applications.</p>
        </div>
        {meta && (
          <div className="text-sm text-c500 font-medium">
            {meta.total} application{meta.total !== 1 ? 's' : ''} total
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-green text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-c600 border border-c100 hover:border-green'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="text-red bg-red p-3 sm:p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-white shadow-sm border border-c100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green"></div>
          </div>
        ) : sellers.length === 0 ? (
          <div className="p-16 text-center text-c500">
            <Users className="w-16 h-16 text-c200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-c900 mb-1">No applications found</h3>
            <p className="text-c500">
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
              <table className="min-w-full divide-y divide-c100">
                <thead className="bg-c100/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">User Details</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Seller Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-black text-c500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-c200">
                  {sellers.map((app) => (
                    <tr key={app.id} className="hover:bg-c100 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-c900">{app.email || app.user?.email || 'N/A'}</div>
                        <div className="text-sm text-c500 line-clamp-1 max-w-xs">
                          {app.seekerProfile?.firstName && app.seekerProfile?.lastName
                            ? `${app.seekerProfile.firstName} ${app.seekerProfile.lastName}`
                            : app.bio || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{badge(app.sellerStatus || app.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-c500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedApp(app)} className="bg-blueL text-blueH hover:bg-blueL px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                            <Eye className="h-4 w-4 mr-1" />View
                          </button>
                          {(app.sellerStatus === 'pending' || app.status === 'pending') && (
                            <>
                              <button onClick={() => handleUpdateStatus(app.id, 'approve')} disabled={isUpdating} className="bg-green text-green hover:bg-green px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors disabled:opacity-50">
                                <CheckCircle className="h-4 w-4 mr-1" />Approve
                              </button>
                              <button onClick={() => handleUpdateStatus(app.id, 'reject')} disabled={isUpdating} className="bg-red text-red hover:bg-red px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors disabled:opacity-50">
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
            <div className="md:hidden divide-y divide-c200">
              {sellers.map((app) => (
                <div key={app.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-c900 truncate">{app.email || app.user?.email || 'N/A'}</h3>
                      <p className="text-xs text-c500 line-clamp-1 mt-0.5">
                        {app.seekerProfile?.firstName && app.seekerProfile?.lastName
                          ? `${app.seekerProfile.firstName} ${app.seekerProfile.lastName}`
                          : app.bio || '—'}
                      </p>
                    </div>
                    {badge(app.sellerStatus || app.status)}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-c500">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedApp(app)} className="text-blue bg-blueL px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium">
                      <Eye className="h-3.5 w-3.5 mr-1" />View
                    </button>
                    {(app.sellerStatus === 'pending' || app.status === 'pending') && (
                      <>
                        <button onClick={() => handleUpdateStatus(app.id, 'approve')} disabled={isUpdating} className="text-green bg-green px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium disabled:opacity-50">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                        </button>
                        <button onClick={() => handleUpdateStatus(app.id, 'reject')} disabled={isUpdating} className="text-red bg-red px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium disabled:opacity-50">
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

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-c500">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-c600 bg-white border border-c200 rounded-xl hover:bg-c100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green rounded-xl hover:bg-green disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Details Modal — bottom sheet on mobile */}
      {selectedApp && (
        <div className="fixed inset-0 bg-c900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-screen overflow-y-auto p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-c900">Application Details</h2>
                {badge(selectedApp.sellerStatus || selectedApp.status)}
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-c400 hover:text-c600 flex-shrink-0">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-c500">Applicant Email</h3>
                <p className="mt-0.5 text-sm sm:text-base text-c900 break-all">{selectedApp.email || selectedApp.user?.email || 'N/A'}</p>
              </div>

              {selectedApp.seekerProfile && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-c500">Name</h3>
                  <p className="mt-0.5 text-sm text-c900">
                    {selectedApp.seekerProfile.firstName} {selectedApp.seekerProfile.lastName}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-c500">Date Submitted</h3>
                  <p className="mt-0.5 text-sm text-c900">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedApp.bio && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-c500">Bio & Experience</h3>
                  <div className="mt-1 text-sm text-c900 bg-c100 p-3 sm:p-4 rounded-lg whitespace-pre-wrap max-h-48 sm:max-h-64 overflow-y-auto">
                    {selectedApp.bio}
                  </div>
                </div>
              )}
            </div>

            {(selectedApp.sellerStatus === 'pending' || selectedApp.status === 'pending') && (
              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 border-t border-c100 pt-6">
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'reject')}
                  disabled={isUpdating}
                  className="px-6 py-3 bg-red text-red rounded-xl hover:bg-red font-bold disabled:opacity-50 w-full sm:w-auto transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'approve')}
                  disabled={isUpdating}
                  className="px-6 py-3 bg-green text-white rounded-xl shadow-lg shadow-green-600/20 hover:bg-green font-bold disabled:opacity-50 w-full sm:w-auto transition-colors"
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
