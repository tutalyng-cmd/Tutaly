import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Building2, ThumbsUp, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

async function getCompanyAggregates(companyName: string) {
  try {
    const res = await api.get(`/reviews/companies/${encodeURIComponent(companyName)}/aggregates`);
    return res.data?.data || null;
  } catch (error) {
    return null;
  }
}

async function getCompanyReviews(companyName: string) {
  try {
    const res = await api.get(`/reviews/companies/${encodeURIComponent(companyName)}`);
    return res.data?.data || [];
  } catch (error) {
    return [];
  }
}

export default async function CompanyReviewDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const companyNameDecoded = decodeURIComponent(resolvedParams.name);
  
  // Capitalize first letter of each word for display
  const displayName = companyNameDecoded.replace(/\b\w/g, l => l.toUpperCase());

  const [aggregates, reviews] = await Promise.all([
    getCompanyAggregates(companyNameDecoded),
    getCompanyReviews(companyNameDecoded)
  ]);

  if (!aggregates && reviews.length === 0) {
    // If no reviews at all, we might want to show an empty state instead of 404
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex flex-col items-center justify-center px-4 text-center">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No reviews for {displayName} yet</h1>
        <p className="text-gray-500 max-w-md mb-8">Be the first to share your experience working at this company. Your review is completely anonymous.</p>
        <Link href="/reviews/write" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-colors">
          Write a Review
        </Link>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  const renderProgressBar = (value: number, max: number = 5) => {
    const percentage = (value / max) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link href="/reviews" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Reviews
        </Link>

        {/* Header Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500 mt-1">{aggregates?.totalReviews || 0} reviews</p>
              
              {aggregates && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-lg font-bold text-lg">
                    {aggregates.avgOverall} <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-gray-400 text-sm">Overall Rating</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <Link href="/reviews/write" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-md text-center transition-colors">
              Write a Review
            </Link>
          </div>
        </div>

        {/* Aggregates Breakdown */}
        {aggregates && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Rating Breakdown</h2>
              
              <div className="space-y-5">
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Work/Life Balance</span>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="flex-1">{renderProgressBar(parseFloat(aggregates.avgWorkLife))}</div>
                    <span className="text-sm font-bold text-gray-900 w-8">{aggregates.avgWorkLife}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Pay & Benefits</span>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="flex-1">{renderProgressBar(parseFloat(aggregates.avgPay))}</div>
                    <span className="text-sm font-bold text-gray-900 w-8">{aggregates.avgPay}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Management</span>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="flex-1">{renderProgressBar(parseFloat(aggregates.avgManagement))}</div>
                    <span className="text-sm font-bold text-gray-900 w-8">{aggregates.avgManagement}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Culture & Values</span>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="flex-1">{renderProgressBar(parseFloat(aggregates.avgCulture))}</div>
                    <span className="text-sm font-bold text-gray-900 w-8">{aggregates.avgCulture}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-teal-600">
                <ThumbsUp className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-gray-900">{aggregates.recommendPercentage}%</h3>
              <p className="text-gray-600 font-medium mt-2">Recommend working here to a friend</p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Employee Reviews</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-500" /> 100% Anonymous
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">&quot;{review.position || 'Employee'}&quot;</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {review.displayName} • {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {renderStars(review.ratingOverall)}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2">Pros</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{review.pros}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2">Cons</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{review.cons}</p>
                  </div>
                </div>
                
                {review.recommend && (
                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-sm font-medium text-teal-700">
                    <ThumbsUp className="w-4 h-4" /> Recommends this company
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
