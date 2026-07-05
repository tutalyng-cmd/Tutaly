'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Plus, Users, Clock, CheckCircle, Zap, X, Loader2, MoreVertical, Edit2, Eye, LayoutDashboard, Share2 } from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState('All statuses');

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
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to initialize boost payment.');
    } finally {
      setProcessingBoost(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (statusFilter === 'All statuses') return true;
    if (statusFilter === 'Active' && job.status === 'active') return true;
    if (statusFilter === 'Draft' && job.status === 'draft') return true;
    if (statusFilter === 'Closed' && job.status === 'expired') return true;
    if (statusFilter === 'Pending Review' && job.status === 'pending_review') return true;
    return false;
  });

  return (
    <>
      <div className="results-bar">
        <p className="results-count">
          <strong>{jobs.length}</strong> job posts
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="results-sort">
            <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending Review</option>
              <option>Draft</option>
              <option>Closed</option>
            </select>
          </div>
          <Link href="/employer/jobs/create" className="btn btn--primary btn--sm">+ Post a new job</Link>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-c500 italic flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          Loading your jobs...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty__icon">
            <LayoutDashboard className="w-6 h-6 text-c400" />
          </div>
          <div className="dash-empty__title">No jobs found</div>
          <div className="dash-empty__desc">You don't have any job postings matching the selected filter.</div>
          <Link href="/employer/jobs/create" className="btn btn--primary btn--sm mt-4">Post your first job</Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {filteredJobs.map((job) => (
            <div key={job.id} className="jobpost-row">
              <div className="jobpost-row__body">
                <div className="jobpost-row__title flex items-center gap-2">
                  {job.title}
                  {job.isFeatured && (
                    <span className="badge badge--new" style={{ borderColor: 'var(--gold)', color: 'var(--gold-h)', background: 'var(--gold-10)' }}>
                      <Zap className="w-3 h-3 mr-1" /> Featured
                    </span>
                  )}
                </div>
                <div className="jobpost-row__meta">
                  Posted {new Date(job.createdAt).toLocaleDateString()} · {job.area ? `${job.area}, ` : ''}{job.state} · {job.jobType} · {job.workMode}
                </div>
              </div>

              <div className="jobpost-row__stats">
                <div className="jobpost-row__stat">
                  <div className="jobpost-row__stat-num">-</div>
                  <div className="jobpost-row__stat-label">Views</div>
                </div>
                <div className="jobpost-row__stat">
                  <div className="jobpost-row__stat-num">-</div>
                  <div className="jobpost-row__stat-label">Applied</div>
                </div>
              </div>

              <div className="jobpost-row__status">
                {job.status === 'active' ? (
                  <span className="status--active text-xs font-semibold px-2 py-1 rounded-full">Active</span>
                ) : job.status === 'pending_review' ? (
                  <span className="status--draft text-xs font-semibold px-2 py-1 rounded-full">Pending Review</span>
                ) : job.status === 'draft' ? (
                  <span className="status--draft text-xs font-semibold px-2 py-1 rounded-full">Draft</span>
                ) : (
                  <span className="status--closed text-xs font-semibold px-2 py-1 rounded-full">Closed</span>
                )}
              </div>

              <div className="jobpost-row__actions ml-2">
                {!job.isFeatured && job.status === 'active' && (
                  <button 
                    onClick={() => setBoostingJob(job)} 
                    className="btn btn--ghost btn--sm" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    title="Boost this job"
                  >
                    <Zap className="w-3 h-3" /> Boost
                  </button>
                )}
                <Link href={`/employer/jobs/${job.id}/applicants`} className="btn btn--ghost btn--sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Manage
                </Link>
                <button className="btn btn--ghost btn--sm" style={{ padding: '6px', minWidth: 'auto' }} title="Options">
                  <MoreVertical className="w-4 h-4 text-c400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boost Modal */}
      {boostingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-c900/40 backdrop-blur-sm transition-opacity" onClick={() => setBoostingJob(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:max-w-xl sm:w-full overflow-hidden border border-c100 animate-in zoom-in-95 duration-200">
            <div className="bg-gold shadow-glow-gold p-6 text-white relative">
              <button onClick={() => setBoostingJob(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <Zap className="w-10 h-10 mb-4 fill-white text-gold drop-shadow-md" />
              <h3 className="text-2xl font-black mb-1 drop-shadow-sm">Boost Your Job</h3>
              <p className="text-gold text-sm font-medium">Get up to 5x more applicants for "{boostingJob.title}"</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {pricingTiers.map((tier) => (
                  <label key={tier.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${selectedTier.id === tier.id ? 'border-gold bg-gold' : 'border-c200 hover:bg-c100'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="boost_tier" 
                        className="w-4 h-4 text-gold focus:ring-gold border-c300"
                        checked={selectedTier.id === tier.id}
                        onChange={() => setSelectedTier(tier)}
                      />
                      <div>
                        <p className="font-bold text-c900">{tier.name} ({tier.duration} days)</p>
                        <p className="text-xs text-c500">{tier.desc}</p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-c900">₦{tier.price.toLocaleString()}</p>
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm font-bold text-c900 mb-2">Select Payment Method</p>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors ${paymentGateway === 'paystack' ? 'border-green bg-green text-green font-bold' : 'border-c200 text-c600 hover:bg-c100'}`}>
                    <input type="radio" className="hidden" checked={paymentGateway === 'paystack'} onChange={() => setPaymentGateway('paystack')} />
                    Paystack
                  </label>
                  <label className={`flex-1 flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors ${paymentGateway === 'flutterwave' ? 'border-green bg-green text-green font-bold' : 'border-c200 text-c600 hover:bg-c100'}`}>
                    <input type="radio" className="hidden" checked={paymentGateway === 'flutterwave'} onChange={() => setPaymentGateway('flutterwave')} />
                    Flutterwave
                  </label>
                </div>
              </div>
              
              <button 
                onClick={handleBoost}
                disabled={processingBoost}
                className="w-full flex items-center justify-center gap-2 bg-c900 hover:bg-black text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl shadow-gray-900/20 transition-all disabled:opacity-50"
              >
                {processingBoost ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₦${selectedTier.price.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
