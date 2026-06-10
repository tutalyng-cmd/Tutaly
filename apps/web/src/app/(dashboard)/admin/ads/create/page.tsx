'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { apiAuth } from '@/lib/api';
import Link from 'next/link';

export default function CreateAdPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'banner',
    placement: 'homepage_top',
    imageUrl: '',
    targetUrl: '',
    startsAt: '',
    endsAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).post('/admin/ads', formData);
      router.push('/admin/ads');
    } catch (err: any) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      setError(error.response?.data?.message || error.message || 'Failed to create ad');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/ads" className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Create New Ad</h1>
          <p className="text-gray-500 mt-1">Configure placement, type, and active dates.</p>
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Ad Type</label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
              >
                <option value="banner">Banner Ad</option>
                <option value="featured_job">Featured Job</option>
                <option value="sponsored">Sponsored Content</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Placement Area</label>
              <select
                name="placement"
                required
                value={formData.placement}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
              >
                <option value="homepage_top">Homepage Top</option>
                <option value="homepage_sidebar">Homepage Sidebar</option>
                <option value="jobs_sidebar">Jobs Sidebar</option>
                <option value="shop_top">Shop Top</option>
                <option value="connect_sidebar">Connect Sidebar</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Image URL</label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://example.com/image.png"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
            />
            <p className="text-xs text-gray-500">Provide a direct link to the banner image.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Target URL</label>
            <input
              type="url"
              name="targetUrl"
              required
              placeholder="https://example.com/landing-page"
              value={formData.targetUrl}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
            />
            <p className="text-xs text-gray-500">Where the user goes when they click the ad.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Start Date & Time</label>
              <input
                type="datetime-local"
                name="startsAt"
                required
                value={formData.startsAt}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">End Date & Time</label>
              <input
                type="datetime-local"
                name="endsAt"
                required
                value={formData.endsAt}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 sm:p-8 flex items-center justify-end border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : (
              <>
                <Save className="w-5 h-5" /> Save Advertisement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
