'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface SalarySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultLocation?: string;
}

export const SalarySubmissionModal: React.FC<SalarySubmissionModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTitle = '', 
  defaultLocation = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      job_title: formData.get('job_title') as string,
      location: formData.get('location') as string,
      base_pay: Number(formData.get('base_pay')),
      pay_period: formData.get('pay_period') as string,
      bonus_pay: Number(formData.get('bonus_pay') || 0),
      years_experience: Number(formData.get('years_experience') || 0)
    };

    try {
      const res = await api.post('/salaries/engine/submit', data);
      if (res.data?.success || res.status === 201 || res.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          // Ideally refresh the page or trigger re-fetch here
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit salary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-c900 border border-c700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-6 border-b border-c800 flex justify-between items-center bg-c800">
          <h2 className="text-xl font-bold text-white">Add Your Salary</h2>
          <button onClick={onClose} className="text-c400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green/20 text-green rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">Salary Submitted!</h3>
            <p className="text-c400">Thank you for contributing to salary transparency. Your submission helps others negotiate fairly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-c300 mb-2">Job Title</label>
              <input 
                name="job_title" 
                defaultValue={defaultTitle} 
                required 
                className="w-full bg-c800 border border-c700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green"
                placeholder="e.g. Software Engineer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-c300 mb-2">Location</label>
              <input 
                name="location" 
                defaultValue={defaultLocation} 
                required 
                className="w-full bg-c800 border border-c700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green"
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-c300 mb-2">Base Pay (NGN)</label>
                <input 
                  name="base_pay" 
                  type="number" 
                  required 
                  min="0"
                  className="w-full bg-c800 border border-c700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green"
                  placeholder="e.g. 5000000"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-c300 mb-2">Per</label>
                <select 
                  name="pay_period" 
                  className="w-full bg-c800 border border-c700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green appearance-none"
                >
                  <option value="yearly">Year</option>
                  <option value="monthly">Month</option>
                  <option value="hourly">Hour</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-c300 mb-2">Bonus / Equity (Optional)</label>
                <input 
                  name="bonus_pay" 
                  type="number" 
                  min="0"
                  className="w-full bg-c800 border border-c700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-c300 mb-2">Years of Exp. (Optional)</label>
                <input 
                  name="years_experience" 
                  type="number" 
                  min="0"
                  max="50"
                  className="w-full bg-c800 border border-c700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green"
                  placeholder="e.g. 3"
                />
              </div>
            </div>

            <div className="text-xs text-c500 mt-2 bg-c800 p-3 rounded-lg border border-c700">
              🔒 Your submission is 100% anonymous. It will be aggregated with other submissions to show market medians.
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-c800">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 rounded-lg border border-c600 text-c300 hover:text-white hover:border-c500 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-green text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Anonymous Salary'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
