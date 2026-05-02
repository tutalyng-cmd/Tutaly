'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function SubmitSalaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    industry: '',
    company: '',
    role: '',
    salaryAmount: '',
    currency: 'NGN',
    salaryPeriod: 'monthly',
    location: '',
    submissionYear: new Date().getFullYear(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salaryAmount: parseFloat(formData.salaryAmount),
        submissionYear: parseInt(formData.submissionYear as any),
      };

      await api.post('/salaries', payload);

      setSuccess(true);
      setTimeout(() => {
        router.push('/salaries');
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit salary');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-teal-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted Anonymously!</h2>
          <p className="text-gray-600 mb-6">Your salary data helps increase transparency for all Nigerian professionals. Thank you!</p>
          <div className="animate-pulse text-teal-600 font-medium">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Share Your Salary</h1>
          <p className="mt-2 text-gray-600 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-500" /> 100% Anonymous. No user data stored.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-2xl p-8 border border-gray-100 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Job Title *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                required
                placeholder="e.g. Backend Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                required
                placeholder="e.g. Fintech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Company</span>
                <span className="text-gray-400 font-normal">Optional</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-black"
                placeholder="Leave blank to hide"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Details *</label>
              <div className="flex rounded-lg shadow-sm">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="rounded-l-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 w-24 bg-gray-50 text-black"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                <input
                  type="number"
                  name="salaryAmount"
                  value={formData.salaryAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 500000"
                  className="flex-1 text-black border-gray-300 border-x-0 focus:border-teal-500 focus:ring-teal-500 z-10"
                />
                <select
                  name="salaryPeriod"
                  value={formData.salaryPeriod}
                  onChange={handleChange}
                  className="rounded-r-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 w-32 bg-gray-50 text-black"
                >
                  <option value="monthly">/ Month</option>
                  <option value="annual">/ Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full text-black rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                placeholder="e.g. Lagos, Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="submissionYear"
                value={formData.submissionYear}
                onChange={handleChange}
                className="w-full text-black rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                required
                min="2000"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="mt-8 border-t pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center min-w-[150px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
