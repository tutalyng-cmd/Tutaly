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
    role: '',
    company: '',
    industry: 'Fintech',
    location: 'Lagos, Nigeria',
    yearsOfExperience: '0–2 years',
    companySize: 'Startup (1–50)',
    currency: 'NGN',
    salaryPeriod: 'monthly',
    salaryAmount: '',
    bonusAmount: '',
    equityValue: '',
    submissionYear: new Date().getFullYear(),
    confirmed: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmed) {
      alert("Please confirm the information is accurate.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salaryAmount: parseFloat(formData.salaryAmount),
        bonusAmount: formData.bonusAmount ? parseFloat(formData.bonusAmount) : undefined,
        equityValue: formData.equityValue ? parseFloat(formData.equityValue) : undefined,
        submissionYear: parseInt(formData.submissionYear as any),
      };

      await api.post('/salaries', payload);

      setSuccess(true);
      setTimeout(() => {
        router.push('/salaries');
      }, 3000);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to submit salary');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-c900 flex items-center justify-center p-4">
        <div className="bg-c800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-c700 premium-hover">
          <div className="w-16 h-16 bg-green bg-opacity-20 text-green rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Submitted Anonymously!</h2>
          <p className="text-c400 mb-6">Your salary data helps increase transparency for all Nigerian professionals. Thank you!</p>
          <div className="animate-pulse text-green font-medium">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-c900 text-c200">
      <header className="text-center pt-16 pb-10 px-6">
        <div className="max-w-layout-xl mx-auto">
          <div className="text-sm font-bold uppercase tracking-widest text-blueL mb-4">
            Salary intelligence
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            Share your salary anonymously
          </h1>
          <p className="text-lg text-c300 max-w-xl mx-auto">
            Help the next person negotiate better. Takes about 2 minutes &mdash; no name, no email required.
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <form onSubmit={handleSubmit} className="bg-c800 border border-c700 rounded-2xl p-8 shadow-md">
          
          {/* Role & Company */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">Role &amp; company</h2>
            
            <div className="mb-5">
              <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-title">
                Job title<span className="text-red ml-1">*</span>
              </label>
              <input
                type="text"
                id="s-title"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                placeholder="e.g. Product Manager"
                className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-company">
                  Company
                </label>
                <input
                  type="text"
                  id="s-company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Flutterwave"
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all mb-1.5"
                />
                <p className="text-xs text-c500">Optional — helps others compare by employer</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-industry">
                  Industry
                </label>
                <select
                  id="s-industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                >
                  <option value="Fintech">Fintech</option>
                  <option value="Tech & Software">Tech &amp; Software</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Experience */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">Location &amp; experience</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-location">
                  Location<span className="text-red ml-1">*</span>
                </label>
                <select
                  id="s-location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                >
                  <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                  <option value="Abuja, Nigeria">Abuja, Nigeria</option>
                  <option value="Port Harcourt, Nigeria">Port Harcourt, Nigeria</option>
                  <option value="Remote, Global">Remote, Global</option>
                  <option value="London, UK">London, UK</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-exp">
                  Years of experience<span className="text-red ml-1">*</span>
                </label>
                <select
                  id="s-exp"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                >
                  <option value="0–2 years">0–2 years</option>
                  <option value="3–6 years">3–6 years</option>
                  <option value="7–10 years">7–10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-size">
                Company size
              </label>
              <select
                id="s-size"
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="w-full max-w-xs bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
              >
                <option value="Startup (1–50)">Startup (1–50)</option>
                <option value="Mid-size (51–500)">Mid-size (51–500)</option>
                <option value="Enterprise (500+)">Enterprise (500+)</option>
              </select>
            </div>
          </div>

          {/* Compensation */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Compensation</h2>
            <p className="text-sm text-c400 mb-5">Enter your base salary before tax. All figures stay anonymous.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-currency">
                  Currency<span className="text-red ml-1">*</span>
                </label>
                <select
                  id="s-currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                >
                  <option value="NGN">₦ Nigerian Naira</option>
                  <option value="USD">$ US Dollar</option>
                  <option value="GBP">£ British Pound</option>
                  <option value="EUR">€ Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-period">
                  Pay period
                </label>
                <select
                  id="s-period"
                  name="salaryPeriod"
                  value={formData.salaryPeriod}
                  onChange={handleChange}
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annually</option>
                </select>
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-base">
                Base salary<span className="text-red ml-1">*</span>
              </label>
              <input
                type="number"
                id="s-base"
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 850000"
                className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-bonus">
                  Annual bonus
                </label>
                <input
                  type="number"
                  id="s-bonus"
                  name="bonusAmount"
                  value={formData.bonusAmount}
                  onChange={handleChange}
                  min="0"
                  placeholder="Optional"
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="s-equity">
                  Equity value
                </label>
                <input
                  type="number"
                  id="s-equity"
                  name="equityValue"
                  value={formData.equityValue}
                  onChange={handleChange}
                  min="0"
                  placeholder="Optional"
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mb-0">
            <label className="flex gap-3 cursor-pointer items-start premium-hover group">
              <div className="relative flex items-start mt-0.5">
                <input 
                  type="checkbox" 
                  name="confirmed"
                  checked={formData.confirmed}
                  onChange={handleChange}
                  className="w-5 h-5 appearance-none border border-c500 rounded bg-c700 checked:bg-blue checked:border-blue transition-colors cursor-pointer group-hover:border-blue" 
                />
                <svg className={`absolute top-1 left-1 w-3 h-3 text-white pointer-events-none transition-opacity ${formData.confirmed ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </svg>
              </div>
              <span className="text-sm text-c200 leading-relaxed group-hover:text-white transition-colors">
                I confirm this information is accurate. I understand my submission is completely anonymous and cannot be traced back to me.
              </span>
            </label>
          </div>

        </form>

        <div className="flex justify-end gap-3 mt-6">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="bg-transparent text-c200 font-medium py-2 px-6 rounded-md border border-c600 hover:border-c400 hover:bg-white bg-opacity-5 transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue text-white font-medium py-2 px-6 rounded-md hover:bg-blueH hover:shadow-glow-blue transition-all duration-200 min-w-layout-sm flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Salary'}
          </button>
        </div>

        <div className="flex items-start gap-3 mt-8 p-4 bg-blue bg-opacity-10 border border-blue border-opacity-20 rounded-md">
          <ShieldCheck className="w-5 h-5 text-blueL shrink-0 mt-0.5" />
          <p className="text-xs text-c400 leading-relaxed m-0">
            Your identity is never stored with your salary data. Tutaly aggregates submissions to build accurate, anonymous market benchmarks.
          </p>
        </div>
      </div>
    </div>
  );
}
