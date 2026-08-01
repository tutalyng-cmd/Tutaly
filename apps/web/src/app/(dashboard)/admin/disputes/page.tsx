import { toast } from 'react-hot-toast';
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const params: Record<string, any> = { page, limit: 10 };
      if (filter) params.status = filter;
      const res = await apiAuth.withToken(token).get('/admin/disputes', { params });
      setDisputes(res.data?.items || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error('Failed to load disputes', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const handleResolve = async (disputeId: string, resolution: string) => {
    const notes = prompt('Enter resolution notes:');
    if (!notes) return;
    setResolvingId(disputeId);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch(`/admin/disputes/${disputeId}`, {
        resolution,
        resolutionNotes: notes,
      });
      fetchDisputes();
    } catch (err) {
      console.error('Failed to resolve dispute', err);
      toast.error('Failed to resolve dispute');
    } finally {
      setResolvingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-red text-red',
      resolved_refund: 'bg-blueL text-blueH',
      resolved_release: 'bg-green text-green',
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-c100 text-c600'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const getName = (u: { email: string; firstName?: string; lastName?: string }) => {
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    return u.email;
  };

  const total = meta?.total || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-c900">Dispute Queue</h1>
          <p className="text-c500 text-sm mt-1">{total} total disputes</p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="border border-c200 rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-green"
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
            <div key={i} className="bg-white rounded-3xl border border-c100 p-6 animate-pulse">
              <div className="h-5 bg-c200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-c100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-c100 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-c300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-c900 mb-2">No disputes found</h3>
          <p className="text-c500 text-sm">Everything is peaceful! 🕊️</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl border border-c100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(d.status)}
                    <span className="text-xs text-c400">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-c900">
                    Order #{d.order.id.slice(0, 8)} • ₦{d.order.amountPaid?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div className="bg-c100 rounded-xl p-4 mb-4">
                <p className="text-sm text-c700 font-medium mb-1">Reason:</p>
                <p className="text-sm text-c600">{d.reason}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-c500 mb-4">
                <span>Raised by: <strong className="text-c700">{getName(d.raisedBy)}</strong></span>
                {d.resolvedBy && (
                  <span>Resolved by: <strong className="text-c700">{d.resolvedBy.email}</strong></span>
                )}
              </div>

              {d.resolutionNotes && (
                <div className="bg-blueL rounded-xl p-3 mb-4 text-sm text-blueH">
                  <strong>Notes:</strong> {d.resolutionNotes}
                </div>
              )}

              {d.status === 'open' && (
                <div className="flex items-center gap-3 pt-3 border-t border-c100">
                  <button
                    onClick={() => handleResolve(d.id, 'resolved_refund')}
                    disabled={resolvingId === d.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red bg-red hover:bg-red px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Refund Buyer
                  </button>
                  <button
                    onClick={() => handleResolve(d.id, 'resolved_release')}
                    disabled={resolvingId === d.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-green bg-green hover:bg-green px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
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

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-c500">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-c600 bg-white border border-c200 rounded-xl hover:bg-c100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green rounded-xl hover:bg-green disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
