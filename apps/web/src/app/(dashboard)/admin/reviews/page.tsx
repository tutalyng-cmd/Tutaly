'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { Star, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/admin/reviews/pending?page=${page}&limit=10`);
      setReviews(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
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
      await apiAuth.withToken(token).patch(`/admin/reviews/${reviewId}/${action}`);
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
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-gray-500 text-sm mt-1">{total} pending reviews</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No pending reviews</h3>
          <p className="text-gray-500 text-sm">All reviews have been moderated. ✨</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{review.companyName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{review.jobTitle}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.ratingOverall)}
                  <span className="text-sm font-bold text-gray-900 ml-1">{review.ratingOverall}/5</span>
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
                  <div key={r.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-500">{r.label}</p>
                    <p className="text-sm font-bold text-gray-900">{r.value}/5</p>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-1">👍 Pros</p>
                  <p className="text-sm text-green-800">{review.pros || '—'}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 mb-1">👎 Cons</p>
                  <p className="text-sm text-red-800">{review.cons || '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${review.recommend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {review.recommend ? '✅ Recommends' : '❌ Does not recommend'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(review.id, 'approve')}
                    disabled={actionId === review.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(review.id, 'reject')}
                    disabled={actionId === review.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
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

      {total > 10 && (
        <div className="flex justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={reviews.length < 10} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
