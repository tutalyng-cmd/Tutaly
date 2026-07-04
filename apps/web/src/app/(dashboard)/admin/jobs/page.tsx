'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Briefcase, Clock, ShieldCheck, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';

type TabStatus = 'pending_review' | 'active' | 'all';

const TABS: { key: TabStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'pending_review', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { key: 'active', label: 'Approved', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'all', label: 'All Jobs', icon: <Briefcase className="w-4 h-4" /> },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending_review: { bg: 'bg-gold', text: 'text-goldH', label: 'Pending' },
  active: { bg: 'bg-green', text: 'text-green', label: 'Active' },
  expired: { bg: 'bg-c100', text: 'text-c600', label: 'Expired' },
  removed: { bg: 'bg-red', text: 'text-red', label: 'Removed' },
};

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabStatus>('pending_review');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');

      let url: string;
      const params: Record<string, any> = { page, limit: 20 };

      if (activeTab === 'pending_review') {
        url = '/admin/queue/jobs';
      } else if (activeTab === 'all') {
        url = '/admin/jobs';
      } else {
        url = '/admin/jobs';
        params.status = activeTab;
      }

      const res = await apiAuth.withToken(token || undefined).get(url, { params });
      const payload = res.data;
      setJobs(payload.items || []);
      setMeta(payload.meta || null);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading jobs');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, router]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApprove = async (jobId: string) => {
    if (!confirm('Approve this job?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/jobs/${jobId}`, {
        action: 'approve',
      });
      fetchJobs();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
alert(err.response?.data?.message || err.message);
    }
  };

  const handleRemove = async (jobId: string) => {
    if (!confirm('Remove this job?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/jobs/${jobId}`, {
        action: 'remove',
      });
      fetchJobs();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
alert(err.response?.data?.message || err.message);
    }
  };

  const badge = (status: string) => {
    const b = STATUS_BADGES[status] || { bg: 'bg-c100', text: 'text-c600', label: status };
    return (
      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-c900">Manage Jobs</h1>
          <p className="text-c500 mt-1">Review, approve, and manage all job listings.</p>
        </div>
        {meta && (
          <div className="text-sm text-c500 font-medium">
            {meta.total} job{meta.total !== 1 ? 's' : ''} total
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-green text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-c600 border border-c100 hover:border-green'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="text-red bg-red p-3 sm:p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-white shadow-sm border border-c100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-16 text-center text-c500">
            <Briefcase className="w-16 h-16 text-c200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-c900 mb-1">No jobs found</h3>
            <p className="text-c500">
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
              <table className="min-w-full divide-y divide-c100">
                <thead className="bg-c100/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Job Details</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Employer</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-black text-c500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-c100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-c100 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-c900">{job.title}</div>
                        <div className="text-sm text-c500">{job.employmentType || job.jobType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-c900">{job.employer?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{badge(job.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-c500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedJob(job)} className="bg-blueL text-blueH hover:bg-blueL px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                            <Eye className="h-4 w-4 mr-1" />View
                          </button>
                          {job.status === 'pending_review' && (
                            <>
                              <button onClick={() => handleApprove(job.id)} className="bg-green text-green hover:bg-green px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                                <CheckCircle className="h-4 w-4 mr-1" />Approve
                              </button>
                              <button onClick={() => handleRemove(job.id)} className="bg-red text-red hover:bg-red px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                                <Trash2 className="h-4 w-4 mr-1" />Remove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards — visible only on mobile */}
            <div className="md:hidden divide-y divide-c200">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-c900 truncate">{job.title}</h3>
                      <p className="text-xs text-c500 mt-0.5">{job.employer?.email || 'N/A'}</p>
                    </div>
                    {badge(job.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-c500">
                      {job.employmentType || job.jobType} · {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedJob(job)} className="text-blue bg-blueL px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium">
                      <Eye className="h-3.5 w-3.5 mr-1" />View
                    </button>
                    {job.status === 'pending_review' && (
                      <>
                        <button onClick={() => handleApprove(job.id)} className="text-green bg-green px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                        </button>
                        <button onClick={() => handleRemove(job.id)} className="text-red bg-red px-3 py-1.5 rounded-md inline-flex items-center text-xs font-medium">
                          <Trash2 className="h-3.5 w-3.5 mr-1" />Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-c500">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-c600 bg-white border border-c200 rounded-xl hover:bg-c100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green rounded-xl hover:bg-green disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-c900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-screen overflow-y-auto p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-c900">Job Details</h2>
              <button onClick={() => setSelectedJob(null)} className="text-c400 hover:text-c600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-c900">{selectedJob.title}</h3>
                {badge(selectedJob.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-c500">Employer</h4>
                  <p className="mt-0.5 text-sm text-c900">{selectedJob.employer?.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-c500">Job Type</h4>
                  <p className="mt-0.5 text-sm text-c900">{selectedJob.jobType || selectedJob.employmentType}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-c500">Work Mode</h4>
                  <p className="mt-0.5 text-sm text-c900">{selectedJob.workMode || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-c500">Location</h4>
                  <p className="mt-0.5 text-sm text-c900">
                    {[selectedJob.area, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.location || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-c500">Salary Range</h4>
                  <p className="mt-0.5 text-sm text-c900">
                    {selectedJob.minSalary || selectedJob.maxSalary
                      ? `${selectedJob.currency || ''} ${selectedJob.minSalary || '?'} – ${selectedJob.maxSalary || '?'}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-c500">Submitted</h4>
                  <p className="mt-0.5 text-sm text-c900">{new Date(selectedJob.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-medium text-c500">Description</h4>
                <div className="mt-1 text-sm text-c900 bg-c100 p-3 sm:p-4 rounded-lg whitespace-pre-wrap max-h-48 sm:max-h-60 overflow-y-auto">
                  {selectedJob.description}
                </div>
              </div>
            </div>

            {selectedJob.status === 'pending_review' && (
              <div className="mt-8 flex justify-end gap-3 border-t border-c100 pt-6">
                <button
                  onClick={() => {
                    handleRemove(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-3 bg-red text-red rounded-xl hover:bg-red font-bold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Remove Job
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-3 bg-green text-white rounded-xl shadow-lg shadow-green-600/20 hover:bg-green font-bold inline-flex items-center justify-center gap-2 transition-colors"
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
