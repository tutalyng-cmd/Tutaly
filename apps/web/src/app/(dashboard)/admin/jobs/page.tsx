'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Briefcase, Clock, ShieldCheck } from 'lucide-react';
import { apiAuth } from '@/lib/api';

type TabStatus = 'pending_review' | 'active' | 'all';

const TABS: { key: TabStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'pending_review', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { key: 'active', label: 'Approved', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'all', label: 'All Jobs', icon: <Briefcase className="w-4 h-4" /> },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Expired' },
  removed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Removed' },
};

export default function AdminJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabStatus>('pending_review');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');

      let url: string;
      if (activeTab === 'pending_review') {
        url = '/admin/jobs/pending';
      } else if (activeTab === 'all') {
        url = '/admin/jobs';
      } else {
        url = `/admin/jobs?status=${activeTab}`;
      }

      const res = await apiAuth.withToken(token || undefined).get(url);
      const payload = res.data;
      setJobs(payload.items || payload.data?.items || (Array.isArray(payload) ? payload : []));
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    if (!confirm('Approve this job?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/jobs/${jobId}/approve`);
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const badge = (status: string) => {
    const b = STATUS_BADGES[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
    return (
      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Manage Jobs</h1>
        <p className="text-gray-500 mt-1">Review, approve, and manage all job listings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-gray-600 border border-gray-100 hover:border-teal-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 bg-red-50 p-3 sm:p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No jobs found</h3>
            <p className="text-gray-500">
            {activeTab === 'pending_review'
              ? 'No pending jobs require approval.'
              : activeTab === 'active'
              ? 'No approved jobs found.'
              : 'No jobs found.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Job Details</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Employer</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.employmentType || job.jobType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.employer?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{badge(job.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedJob(job)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                            <Eye className="h-4 w-4 mr-1" />View
                          </button>
                          {job.status === 'pending_review' && (
                            <button onClick={() => handleApprove(job.id)} className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                              <CheckCircle className="h-4 w-4 mr-1" />Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards — visible only on mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{job.employer?.email || 'N/A'}</p>
                    </div>
                    {badge(job.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {job.employmentType || job.jobType} · {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedJob(job)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium">
                      <Eye className="h-3.5 w-3.5 mr-1" />View
                    </button>
                    {job.status === 'pending_review' && (
                      <button onClick={() => handleApprove(job.id)} className="text-green-600 bg-green-50 px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Job Details</h2>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{selectedJob.title}</h3>
                {badge(selectedJob.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500">Employer</h4>
                  <p className="mt-0.5 text-sm text-gray-900">{selectedJob.employer?.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500">Job Type</h4>
                  <p className="mt-0.5 text-sm text-gray-900">{selectedJob.jobType || selectedJob.employmentType}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500">Work Mode</h4>
                  <p className="mt-0.5 text-sm text-gray-900">{selectedJob.workMode || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500">Location</h4>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {[selectedJob.area, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.location || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500">Salary Range</h4>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {selectedJob.minSalary || selectedJob.maxSalary
                      ? `${selectedJob.currency || ''} ${selectedJob.minSalary || '?'} – ${selectedJob.maxSalary || '?'}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500">Submitted</h4>
                  <p className="mt-0.5 text-sm text-gray-900">{new Date(selectedJob.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">Description</h4>
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 sm:p-4 rounded-lg whitespace-pre-wrap max-h-48 sm:max-h-60 overflow-y-auto">
                  {selectedJob.description}
                </div>
              </div>
            </div>

            {selectedJob.status === 'pending_review' && (
              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <button
                  onClick={() => {
                    handleApprove(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 font-bold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Job
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
