'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Loader2, ArrowRight, X, Sparkles, Building2, Users, Star, Plus } from 'lucide-react';

export default function EmployerOverviewPage() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    pendingJobs: 0,
    totalJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(true);

  // We can fetch user profile to get company name
  const [companyName, setCompanyName] = useState('Employer');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const resStats = await apiAuth.withToken(token).get('/jobs/employer/stats');
        setStats(resStats.data);

        // Try to fetch profile for company name
        try {
           const profileRes = await apiAuth.withToken(token).get('/user/employer/profile');
           if (profileRes.data?.companyName) {
             setCompanyName(profileRes.data.companyName);
           }
        } catch(e) {}

      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <>
      {showAd && (
        <div className="ad-banner">
          <div className="ad-banner__left">
            <div className="ad-banner__icon">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="ad-banner__title">Get more qualified applicants</div>
              <div className="ad-banner__desc">Boost your job posts to the top of search results — starts at ₦15,000.</div>
            </div>
          </div>
          <Link href="/employer/advertise" className="ad-banner__cta" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--gold-h)' }}>Create a campaign</span>
            <ArrowRight className="w-4 h-4 ad-banner__arrow" />
          </Link>
          <button className="ad-banner__dismiss" onClick={(e) => { e.preventDefault(); setShowAd(false); }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="dcard" style={{ background: 'linear-gradient(135deg, var(--blue-14), var(--gold-06))', borderColor: 'var(--c-700)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '4px' }}>Welcome back, {companyName} 👋</div>
            <div style={{ fontSize: '13px', color: 'var(--c-400)' }}>You have {stats.totalApplicants} total applicants across {stats.activeJobs} active job posts.</div>
          </div>
          <Link href="/employer/jobs/create" className="btn btn--primary btn--sm">Post a new job</Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Active job posts</div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.activeJobs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total applicants</div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalApplicants}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Pending Review</div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.pendingJobs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Jobs</div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalJobs}</div>
        </div>
      </div>

      <div className="overview-grid mt-6">
        <div>
          <div className="dcard" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="dcard__header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-700)' }}>
              <div>
                <div className="dcard__title">Your job posts</div>
                <div className="dcard__sub">Recent listings and performance</div>
              </div>
              <Link href="/employer/jobs" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue-l)' }}>View all</Link>
            </div>
            
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-400)' }}>
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">View and manage all your active listings.</p>
              <Link href="/employer/jobs" className="btn btn--ghost btn--sm mt-4">Manage Jobs</Link>
            </div>
          </div>
        </div>

        <div>
          <div className="dcard" style={{ marginBottom: '16px' }}>
            <div className="dcard__header">
              <div>
                <div className="dcard__title">Hiring pipeline</div>
                <div className="dcard__sub">Across all active jobs</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--c-300)' }}>Pending Review</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--c-100)' }}>{loading ? '-' : stats.pendingJobs}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--c-300)' }}>Total Applicants</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--c-100)' }}>{loading ? '-' : stats.totalApplicants}</span>
              </div>
            </div>
          </div>

          <div className="dcard" style={{ background: 'linear-gradient(135deg, var(--green-10), var(--green-02))', borderColor: 'var(--green-20)' }}>
            <div className="dcard__title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star className="w-4 h-4 text-green" /> Current plan
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--c-100)' }}>Growth Plan</div>
                <div style={{ fontSize: '12px', color: 'var(--c-400)' }}>Renews Oct 12, 2024</div>
              </div>
              <Link href="/employer/profile" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue-l)' }}>Manage</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
