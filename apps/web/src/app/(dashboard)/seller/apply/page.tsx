'use client';

import { toast } from 'react-hot-toast';

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
      router.push('/seller');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create profile');
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


  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="page-header rounded-2xl p-8 mb-8" style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green text-white rounded-xl flex items-center justify-center shadow-md">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-c100 mb-2">Become a Tutaly Seller</h1>
            <p className="text-c300 max-w-xl text-lg">
              Join the Tutaly shop and start selling your digital products, physical goods, and professional services to thousands of users.
            </p>
          </div>
        </div>
      </div>

      <div className="dcard" style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)' }}>
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-c100 mb-6">Seller Application</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-c100 mb-2">
                Business Bio / About You
              </label>
              <textarea
                required
                rows={4}
                className="input text-black h-24"
                placeholder="Tell us about yourself or your business. What kind of products/services do you plan to offer?"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <p className="mt-2 text-sm text-c500">
                This helps our buyers understand your business.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-c100 mb-2">
                Primary Category Focus
              </label>
              <input
                type="text"
                required
                className="input text-black"
                placeholder="e.g. Resume Templates, Career Coaching, Office Supplies"
                value={formData.categoryFocus}
                onChange={(e) => setFormData({ ...formData, categoryFocus: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-c100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn--primary px-8 py-3 text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <>
                    Create Profile <ArrowRight className="w-5 h-5 ml-2" />
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
