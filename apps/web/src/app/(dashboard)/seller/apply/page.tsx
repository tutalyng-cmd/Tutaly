'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function ApplySellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bio: '',
    categoryFocus: '',
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const res = await apiAuth.withToken(token).get('/shop/seller/status');
      const currentStatus = res.data?.sellerStatus || res.data?.data?.sellerStatus || 'none';
      setStatus(currentStatus);

      if (currentStatus === 'approved') {
        router.push('/seller');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token!).post('/shop/seller/apply', formData);
      alert('Application submitted successfully!');
      setStatus('pending');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green" />
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-c100 p-8 text-center">
        <div className="w-16 h-16 bg-blueL text-blue rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-c900 mb-4">Application Under Review</h2>
        <p className="text-c600 mb-8">
          Your application to become a seller on Tutaly is currently being reviewed by our admin team. We will notify you once a decision has been made.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-c100 text-c700 px-6 py-2 rounded-lg font-medium hover:bg-c200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-c100 p-8 text-center">
        <div className="w-16 h-16 bg-red text-red rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-c900 mb-4">Application Rejected</h2>
        <p className="text-c600 mb-8">
          Unfortunately, your application to become a seller was not approved at this time.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-c100 text-c700 px-6 py-2 rounded-lg font-medium hover:bg-c200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-green rounded-2xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
            <Store className="w-6 h-6 text-green" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Become a Tutaly Seller</h1>
          <p className="text-green max-w-xl text-lg">
            Join the Tutaly marketplace and start selling your digital products, physical goods, and professional services to thousands of users.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute right-40 bottom-0 w-48 h-48 bg-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/4"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-c100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-c900 mb-6">Seller Application</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-c900 mb-2">
                Business Bio / About You
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-c200 focus:ring-2 focus:ring-green focus:border-transparent transition-all resize-none text-black"
                placeholder="Tell us about yourself or your business. What kind of products/services do you plan to offer?"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <p className="mt-2 text-sm text-c500">
                This helps our team understand your business and approve your application faster.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-c900 mb-2">
                Primary Category Focus
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-c200 focus:ring-2 focus:ring-green focus:border-transparent transition-all text-black"
                placeholder="e.g. Resume Templates, Career Coaching, Office Supplies"
                value={formData.categoryFocus}
                onChange={(e) => setFormData({ ...formData, categoryFocus: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-c100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Submit Application <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
