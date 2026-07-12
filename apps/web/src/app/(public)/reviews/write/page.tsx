'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const StarRating = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const getLabel = (val: number) => {
    switch (val) {
      case 5: return "5 out of 5 — Excellent";
      case 4: return "4 out of 5 — Very good";
      case 3: return "3 out of 5 — Average";
      case 2: return "2 out of 5 — Poor";
      case 1: return "1 out of 5 — Terrible";
      default: return "Select Rating";
    }
  };

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-3xl leading-none transition-all duration-150 hover:scale-110 ${
              star <= (hoverValue || value) ? 'text-gold' : 'text-c600'
            }`}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
      <div className="text-xs text-c500 h-5">{getLabel(hoverValue || value)}</div>
    </div>
  );
};

export default function WriteReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    ratingOverall: 0,
    position: '',
    tenure: 'Less than 1 year',
    employmentStatus: 'Current employee',
    reviewTitle: '',
    pros: '',
    cons: '',
    recommend: true,
    confirmed: true,
    
    // Kept to satisfy existing backend logic if required
    sector: '',
    ratingWorkLife: 0,
    ratingPay: 0,
    ratingManagement: 0,
    ratingCulture: 0,
    displayName: 'Anonymous User',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleRecommend = () => {
    setFormData(prev => ({ ...prev, recommend: !prev.recommend }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmed) {
      alert("Please confirm the information is accurate.");
      return;
    }
    if (formData.ratingOverall === 0) {
      alert('Please provide an overall rating');
      return;
    }
    if (formData.pros.length < 10 || formData.cons.length < 10) {
      alert('Pros and Cons must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      await api.post('/reviews/companies', formData, config);

      setSuccess(true);
      setTimeout(() => {
        router.push('/reviews');
      }, 3000);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to submit review');
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
          <h2 className="text-2xl font-bold text-white mb-2">Review Submitted!</h2>
          <p className="text-c400 mb-6">Thank you for your anonymous contribution. Your review is pending moderation and will be published shortly.</p>
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
            Company reviews
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            Share your experience
          </h1>
          <p className="text-lg text-c300 max-w-xl mx-auto">
            Help other professionals make informed decisions. Your review is anonymous by default.
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <form onSubmit={handleSubmit} className="bg-c800 border border-c700 rounded-2xl p-8 shadow-md">
          
          {/* Which company? */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">Which company?</h2>
            
            <div className="mb-2">
              <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="r-company">
                Company name<span className="text-red ml-1">*</span>
              </label>
              <div className="flex bg-c700 border border-c500 rounded-md overflow-hidden transition-all focus-within:border-blue focus-within:ring-1 focus-within:ring-blue">
                <input
                  type="text"
                  id="r-company"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Search for a company or type name..."
                  className="w-full bg-transparent border-none outline-none py-2 px-3 text-sm text-white placeholder:text-c500"
                />
              </div>
            </div>
            
            {formData.companyName.toLowerCase() === 'paystack' && (
              <div className="inline-flex items-center gap-2 py-2 px-3 pl-2 bg-c700 border border-c600 rounded-full mt-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-green bg-opacity-20 text-green">P</div>
                <span className="text-sm font-semibold text-c100">Paystack</span>
              </div>
            )}
          </div>

          {/* Overall rating */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">
              Overall rating<span className="text-red ml-1">*</span>
            </h2>
            <StarRating 
              value={formData.ratingOverall} 
              onChange={(val) => setFormData(prev => ({ ...prev, ratingOverall: val }))} 
            />
          </div>

          {/* Your role */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">Your role</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="r-jobtitle">
                  Job title
                </label>
                <input
                  type="text"
                  id="r-jobtitle"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g. Product Manager"
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="r-tenure">
                  Time at company
                </label>
                <select
                  id="r-tenure"
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleChange}
                  className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                >
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1–2 years">1–2 years</option>
                  <option value="3–5 years">3–5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-c300 mb-2 uppercase tracking-wide" htmlFor="r-status">
                Employment status
              </label>
              <select
                id="r-status"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full max-w-xs bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
              >
                <option value="Current employee">Current employee</option>
                <option value="Former employee">Former employee</option>
              </select>
            </div>
          </div>

          {/* Review title */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">
              Review title<span className="text-red ml-1">*</span>
            </h2>
            <input
              type="text"
              name="reviewTitle"
              value={formData.reviewTitle}
              onChange={handleChange}
              required
              placeholder="Sum up your experience in one line"
              className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
            />
          </div>

          {/* Pros */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">
              Pros<span className="text-red ml-1">*</span>
            </h2>
            <div className="relative">
              <textarea
                name="pros"
                value={formData.pros}
                onChange={handleChange}
                required
                maxLength={600}
                rows={4}
                placeholder="What did you like about working here?"
                className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all resize-y"
              />
              <div className="text-xs text-c500 absolute bottom-3 right-3 text-right">
                {formData.pros.length} / 600
              </div>
            </div>
          </div>

          {/* Cons */}
          <div className="mb-8 border-b border-c700 pb-8">
            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wide">
              Cons<span className="text-red ml-1">*</span>
            </h2>
            <div className="relative">
              <textarea
                name="cons"
                value={formData.cons}
                onChange={handleChange}
                required
                maxLength={600}
                rows={4}
                placeholder="What could be improved?"
                className="w-full bg-c700 border border-c600 rounded-md py-2 px-3 text-sm text-white placeholder:text-c500 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all resize-y"
              />
              <div className="text-xs text-c500 absolute bottom-3 right-3 text-right">
                {formData.cons.length} / 600
              </div>
            </div>
          </div>

          {/* Recommend Toggle & Confirmation */}
          <div className="mb-0">
            <div className="flex items-center justify-between gap-5 py-4 cursor-pointer select-none premium-hover group" onClick={handleToggleRecommend}>
              <div>
                <div className="text-base font-semibold text-white mb-1 group-hover:text-blueL transition-colors">Would you recommend this company?</div>
                <div className="text-sm text-c400">Shown as a badge on your review</div>
              </div>
              <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${formData.recommend ? 'bg-blue' : 'bg-c600'}`}>
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.recommend ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>
            
            <label className="flex gap-3 cursor-pointer items-start premium-hover group mt-4">
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
                I understand this review is public and will be posted anonymously, without my name or job title's exact wording revealed.
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
            Save Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue text-white font-medium py-2 px-6 rounded-md hover:bg-blueH hover:shadow-glow-blue transition-all duration-200 min-w-layout-sm flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Review'}
          </button>
        </div>

      </div>
    </div>
  );
}
