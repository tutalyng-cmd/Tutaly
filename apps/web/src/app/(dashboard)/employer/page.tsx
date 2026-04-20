'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Briefcase, Users, Star, Plus } from 'lucide-react';

export default function EmployerOverviewPage() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    pendingJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        // Use existing endpoint to fetch jobs and calculate stats
        const res = await apiAuth.withToken(token).get('/jobs/employer/me');
        const jobs = res.data;
        
        const active = jobs.filter((j: { status: string }) => j.status === 'active').length;
        const pending = jobs.filter((j: { status: string }) => j.status === 'pending_review').length;
        // Approximation: count length of arrays if joined, or 0 for now
        
        setStats({
          activeJobs: active,
          totalApplicants: 0, // Would need aggregate endpoint, stubbed for now
          pendingJobs: pending
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
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
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your active job postings and candidate pipeline.</p>
        </div>
        <Link 
          href="/employer/jobs/create" 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" /> Post a New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Stat Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
          <div className="bg-teal-50 p-3 rounded-lg text-teal-600 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '-' : stats.activeJobs}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Applicants</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '-' : stats.totalApplicants}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Review</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '-' : stats.pendingJobs}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center flex-col">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Welcome to Tutaly Employer Workspace</h3>
        <p className="max-w-md mx-auto">Click &quot;My Jobs&quot; on the left to review your current listings and evaluate candidates.</p>
      </div>
    </div>
  );
}
