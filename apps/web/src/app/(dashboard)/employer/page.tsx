'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Briefcase, Users, Star, Plus, Loader2 } from 'lucide-react';

export default function EmployerOverviewPage() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    pendingJobs: 0,
    totalJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const res = await apiAuth.withToken(token).get('/jobs/employer/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--c-100)' }}>Employer Dashboard</h1>
          <p style={{ color: 'var(--c-400)', marginTop: '8px' }}>Manage your active job postings and candidate pipeline.</p>
        </div>
        <Link
          href="/employer/jobs/create"
          className="btn btn--primary"
          style={{ flexShrink: 0 }}
        >
          <Plus className="w-5 h-5" /> Post a New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Active Jobs Card */}
        <div style={{ background: 'var(--c-800)', borderRadius: 'var(--r-xl)', border: '1px solid var(--c-700)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div className="bg-green/20 p-3 rounded-md text-green shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-400)' }}>Active Jobs</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--c-100)', marginTop: '4px' }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.activeJobs}
            </h3>
          </div>
        </div>

        {/* Total Applicants Card */}
        <Link href="/employer/jobs" className="block group">
          <div style={{ background: 'var(--c-800)', borderRadius: 'var(--r-xl)', border: '1px solid var(--c-700)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', transition: 'all 0.2s' }} className="hover:border-blue">
            <div className="bg-blue/20 p-3 rounded-md text-blueL shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-400)' }}>Total Applicants</p>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--c-100)', marginTop: '4px' }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalApplicants}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--blue-l)', marginTop: '4px' }}>View all &rarr;</p>
            </div>
          </div>
        </Link>

        {/* Pending Review Card */}
        <div style={{ background: 'var(--c-800)', borderRadius: 'var(--r-xl)', border: '1px solid var(--c-700)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div className="bg-gold/20 p-3 rounded-md text-goldH shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-400)' }}>Pending Review</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--c-100)', marginTop: '4px' }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.pendingJobs}
            </h3>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--c-800)', borderRadius: 'var(--r-xl)', border: '1px solid var(--c-700)', padding: '48px', textAlign: 'center', color: 'var(--c-400)', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--c-100)', marginBottom: '8px' }}>Welcome to Tutaly Employer Workspace</h3>
        <p style={{ maxWidth: '400px', margin: '0 auto' }}>Click "My Jobs" on the left to review your current listings and evaluate candidates.</p>
      </div>
    </div>
  );
}
