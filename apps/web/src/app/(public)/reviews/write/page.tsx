'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function WriteReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    sector: '',
    position: '',
    ratingOverall: 0,
    ratingWorkLife: 0,
    ratingPay: 0,
    ratingManagement: 0,
    ratingCulture: 0,
    pros: '',
    cons: '',
    recommend: true,
    displayName: 'Anonymous Ninja',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('rating')) {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (formData.ratingOverall === 0) {
        alert('Please provide an overall rating');
        setLoading(false);
        return;
      }
      if (formData.pros.length < 10 || formData.cons.length < 10) {
        alert('Pros and Cons must be at least 10 characters long');
        setLoading(false);
        return;
      }

      // Try with token if available (to link to user if they choose, though backend currently doesn't require it)
      const token = localStorage.getItem('access_token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      await api.post('/reviews/companies', formData, config);

      setSuccess(true);
      setTimeout(() => {
        router.push('/reviews');
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
      setLoading(false);
    }
  };

  const RatingSelect = ({ name, label }: { name: string, label: string }) => (
    <div>
      <label className="block text-sm font-medium text-black-700 mb-1">{label}</label>
      <select
        name={name}
        value={(formData as any)[name]}
        onChange={handleChange}
        className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-gray-900"
        required={name === 'ratingOverall'}
      >
        <option value={0} disabled>Select Rating</option>
        <option value={5}>5 - Excellent</option>
        <option value={4}>4 - Good</option>
        <option value={3}>3 - Average</option>
        <option value={2}>2 - Poor</option>
        <option value={1}>1 - Terrible</option>
      </select>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-teal-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
          <p className="text-gray-600 mb-6">Thank you for your anonymous contribution. Your review is pending moderation and will be published shortly.</p>
          <div className="animate-pulse text-teal-600 font-medium">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Write an Anonymous Review</h1>
          <p className="mt-2 text-gray-600 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-500" /> Your identity is 100% protected
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-2xl p-8 border border-gray-100">

          <div className="space-y-8">
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Company Details</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-gray-900"
                    required
                    placeholder="e.g. Paystack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input
                    type="text"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-gray-900"
                    placeholder="e.g. Fintech"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Position / Role</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-gray-900"
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Ratings */}
            <div>
              <h3 className="text-lg font-semibold text-black border-b pb-2 mb-4">Ratings</h3>
              <div className="grid grid-cols-1 text-black gap-6 sm:grid-cols-2">
                <RatingSelect name="ratingOverall" label="Overall Rating *" />
                <RatingSelect name="ratingWorkLife" label="Work-Life Balance" />
                <RatingSelect name="ratingPay" label="Pay & Benefits" />
                <RatingSelect name="ratingManagement" label="Management" />
                <RatingSelect name="ratingCulture" label="Culture & Values" />
              </div>
            </div>

            {/* Section 3: Detailed Review */}
            <div>
              <h3 className="text-lg font-semibold text-black border-b pb-2 mb-4">Your Review</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pros * (What do you like?)</label>
                  <textarea
                    name="pros"
                    value={formData.pros}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-gray-900"
                    required
                    placeholder="Minimum 10 characters..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cons * (What needs improvement?)</label>
                  <textarea
                    name="cons"
                    value={formData.cons}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-gray-900"
                    required
                    placeholder="Minimum 10 characters..."
                  />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    name="recommend"
                    id="recommend"
                    checked={formData.recommend}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="recommend" className="text-sm font-medium text-gray-900">
                    I would recommend this company to a friend
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name (Nickname)</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-gray-900"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This is what other users will see. Keep it anonymous.</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-10 border-t pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center min-w-[200px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Anonymous Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
