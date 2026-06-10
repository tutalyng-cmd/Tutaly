'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Plus, Users, Clock, CheckCircle, Zap, X, Loader2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  jobType: string;
  workMode: string;
  status: string;
  area?: string;
  state: string;
  createdAt: string;
  isFeatured?: boolean;
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [boostingJob, setBoostingJob] = useState<Job | null>(null);
  const [processingBoost, setProcessingBoost] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/jobs/employer/me');
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch employer jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  const pricingTiers = [
    { id: 'basic', name: 'Basic Boost', duration: 7, price: 5000, desc: 'Top of search results' },
    { id: 'standard', name: 'Standard Boost', duration: 14, price: 8500, desc: 'Top results + homepage carousel' },
    { id: 'premium', name: 'Premium Boost', duration: 30, price: 15000, desc: 'Top results + homepage + newsletter' },
  ];

  const [selectedTier, setSelectedTier] = useState(pricingTiers[0]);
  const [paymentGateway, setPaymentGateway] = useState<'paystack' | 'flutterwave'>('paystack');

  const handleBoost = async () => {
    if (!boostingJob) return;
    setProcessingBoost(true);
    try {
      const token = localStorage.getItem('access_token');
      // Assume ads service generates payment link or directly applies boost if wallet/credits exist
      const res = await apiAuth.withToken(token || undefined).post('/ads/campaigns', {
        job_id: boostingJob.id,
        goal: 'promote_job',
        format: 'sponsored_job',
        destination_url: `/jobs/${boostingJob.id}`,
        placements: selectedTier.id === 'basic' ? ['featured_jobs'] : ['featured_jobs', 'homepage_hero'],
        starts_at: new Date(),
        run_continuously: true,
        daily_budget: selectedTier.price / selectedTier.duration,
        total_budget: selectedTier.price,
        currency: 'NGN',
        paymentGateway,
      });
      
      if (res.data.payment && res.data.payment.url) {
        window.location.href = res.data.payment.url;
      } else if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert("Job boosted successfully!");
        setBoostingJob(null);
        fetchJobs(); // refresh
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
alert(err.response?.data?.message || 'Failed to initialize boost payment.');
    } finally {
      setProcessingBoost(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Your Jobs</h1>
          <p className="text-gray-500 mt-1">View your postings, track applications, and manage your hiring pipeline.</p>
        </div>
        <Link href="/employer/jobs/create" className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition">
          <Plus className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 italic">Loading your jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-sm">Get started by creating your first job post to find top talent in Nigeria.</p>
            <Link href="/employer/jobs/create" className="mt-4 inline-block bg-white text-teal-600 font-medium border border-teal-200 px-4 py-2 rounded-lg hover:bg-teal-50">
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Job Title</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date Posted</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {job.title}
                        {job.isFeatured && (
                          <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            <Zap className="w-3 h-3 fill-white" /> FEATURED
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500">{job.jobType} · {job.workMode}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {job.area ? `${job.area}, ` : ''}{job.state}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {job.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : job.status === 'pending_review' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      ) : job.status === 'expired' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {job.status}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-3">
                        {!job.isFeatured && job.status === 'active' && (
                          <button 
                            onClick={() => setBoostingJob(job)}
                            className="text-amber-600 hover:text-amber-700 flex items-center gap-1 text-xs font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-200 transition-colors"
                          >
                            <Zap className="w-3 h-3" /> Boost
                          </button>
                        )}
                        <Link href={`/employer/jobs/${job.id}/applicants`} className="text-teal-600 hover:text-teal-900 flex items-center gap-1 border-l pl-3 border-gray-200">
                          <Users className="w-4 h-4" /> Applicants
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Boost Modal */}
      {boostingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setBoostingJob(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:max-w-xl sm:w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative">
              <button onClick={() => setBoostingJob(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <Zap className="w-10 h-10 mb-4 fill-white text-amber-200 drop-shadow-md" />
              <h3 className="text-2xl font-black mb-1 drop-shadow-sm">Boost Your Job</h3>
              <p className="text-amber-100 text-sm font-medium">Get up to 5x more applicants for "{boostingJob.title}"</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {pricingTiers.map((tier) => (
                  <label key={tier.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${selectedTier.id === tier.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="boost_tier" 
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                        checked={selectedTier.id === tier.id}
                        onChange={() => setSelectedTier(tier)}
                      />
                      <div>
                        <p className="font-bold text-gray-900">{tier.name} ({tier.duration} days)</p>
                        <p className="text-xs text-gray-500">{tier.desc}</p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-gray-900">₦{tier.price.toLocaleString()}</p>
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-2">Select Payment Method</p>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors ${paymentGateway === 'paystack' ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="radio" className="hidden" checked={paymentGateway === 'paystack'} onChange={() => setPaymentGateway('paystack')} />
                    Paystack
                  </label>
                  <label className={`flex-1 flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors ${paymentGateway === 'flutterwave' ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="radio" className="hidden" checked={paymentGateway === 'flutterwave'} onChange={() => setPaymentGateway('flutterwave')} />
                    Flutterwave
                  </label>
                </div>
              </div>
              
              <button 
                onClick={handleBoost}
                disabled={processingBoost}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl shadow-gray-900/20 transition-all disabled:opacity-50"
              >
                {processingBoost ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₦${selectedTier.price.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
