'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface DisputeData {
  id: string;
  reason: string;
  status: string;
  evidenceUrls: string[];
  resolutionNotes?: string;
  order: { id: string; amountPaid: number; status: string };
  raisedBy: { id: string; email: string; firstName?: string; lastName?: string };
  resolvedBy?: { email: string };
  createdAt: string;
  resolvedAt?: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (filter) params.set('status', filter);
      const res = await apiAuth.withToken(token).get(`/admin/disputes?${params}`);
      setDisputes(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load disputes', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const handleResolve = async (disputeId: string, status: string) => {
    const notes = prompt('Enter resolution notes:');
    if (!notes) return;
    setResolvingId(disputeId);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch(`/admin/disputes/${disputeId}/resolve`, {
        status,
        resolutionNotes: notes,
      });
      fetchDisputes();
    } catch (err) {
      console.error('Failed to resolve dispute', err);
      alert('Failed to resolve dispute');
    } finally {
      setResolvingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-red-100 text-red-700',
      resolved_refund: 'bg-blue-100 text-blue-700',
      resolved_release: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const getName = (u: { email: string; firstName?: string; lastName?: string }) => {
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    return u.email;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Queue</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total disputes</p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="resolved_refund">Resolved (Refund)</option>
          <option value="resolved_release">Resolved (Release)</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No disputes found</h3>
          <p className="text-gray-500 text-sm">Everything is peaceful! 🕊️</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(d.status)}
                    <span className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Order #{d.order.id.slice(0, 8)} • ₦{d.order.amountPaid?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 font-medium mb-1">Reason:</p>
                <p className="text-sm text-gray-600">{d.reason}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Raised by: <strong className="text-gray-700">{getName(d.raisedBy)}</strong></span>
                {d.resolvedBy && (
                  <span>Resolved by: <strong className="text-gray-700">{d.resolvedBy.email}</strong></span>
                )}
              </div>

              {d.resolutionNotes && (
                <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm text-blue-800">
                  <strong>Notes:</strong> {d.resolutionNotes}
                </div>
              )}

              {d.status === 'open' && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleResolve(d.id, 'resolved_refund')}
                    disabled={resolvingId === d.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Refund Buyer
                  </button>
                  <button
                    onClick={() => handleResolve(d.id, 'resolved_release')}
                    disabled={resolvingId === d.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Release to Seller
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={disputes.length < 10} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
