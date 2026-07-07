'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { Star, CheckCircle, XCircle, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewData {
  id: string;
  companyName: string;
  jobTitle: string;
  ratingOverall: number;
  ratingWorkLife: number;
  ratingPay: number;
  ratingManagement: number;
  ratingCulture: number;
  pros: string;
  cons: string;
  recommend: boolean;
  status: string;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/admin/queue/reviews`, {
        params: { page, limit: 10 },
      });
      setReviews(res.data?.items || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
    setActionId(reviewId);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch(`/admin/reviews/${reviewId}`, {
        action,
      });
      fetchReviews();
    } catch (err) {
      console.error(`Failed to ${action} review`, err);
      alert(`Failed to ${action} review`);
    } finally {
      setActionId(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-gold fill-yellow-400' : 'text-c200'}`} />
      ))}
    </div>
  );

  const total = meta?.total || 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-c900">Company Review Moderation</h1>
        <p className="text-c500 text-sm mt-1">{total} pending company reviews</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-c100 p-6 animate-pulse">
              <div className="h-5 bg-c200 rounded w-1/4 mb-3" />
              <div className="h-4 bg-c100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-c100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-c100 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-c300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-c900 mb-2">No pending company reviews</h3>
          <p className="text-c500 text-sm">All company reviews have been moderated. ✨</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl border border-c100 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-c900">{review.companyName}</h3>
                  <p className="text-sm text-c500 mt-0.5">{review.jobTitle}</p>
                  <p className="text-xs text-c400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.ratingOverall)}
                  <span className="text-sm font-bold text-c900 ml-1">{review.ratingOverall}/5</span>
                </div>
              </div>

              {/* Ratings Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Work-Life', value: review.ratingWorkLife },
                  { label: 'Pay', value: review.ratingPay },
                  { label: 'Management', value: review.ratingManagement },
                  { label: 'Culture', value: review.ratingCulture },
                ].map(r => (
                  <div key={r.label} className="bg-c100 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-c500">{r.label}</p>
                    <p className="text-sm font-bold text-c900">{r.value}/5</p>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-green rounded-xl p-4">
                  <p className="text-xs font-semibold text-green mb-1">👍 Pros</p>
                  <p className="text-sm text-green">{review.pros || '—'}</p>
                </div>
                <div className="bg-red rounded-xl p-4">
                  <p className="text-xs font-semibold text-red mb-1">👎 Cons</p>
                  <p className="text-sm text-red">{review.cons || '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${review.recommend ? 'bg-green text-green' : 'bg-red text-red'}`}>
                  {review.recommend ? '✅ Recommends' : '❌ Does not recommend'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(review.id, 'approve')}
                    disabled={actionId === review.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-green bg-green hover:bg-green px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(review.id, 'reject')}
                    disabled={actionId === review.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red bg-red hover:bg-red px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
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
