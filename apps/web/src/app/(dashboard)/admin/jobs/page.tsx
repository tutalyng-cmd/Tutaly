'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function AdminJobsPage() {
  const router = useRouter();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/jobs/pending');
      setJobs(res.data.items || []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.message || 'Error loading jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    if (!confirm('Approve this job?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/jobs/${jobId}/approve`);
      // Refresh list
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approve Jobs</h1>
        <p className="text-gray-500 mt-1">Review and approve pending job listings</p>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending jobs require approval.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500">{job.employmentType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.employer?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleApprove(job.id)}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md inline-flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    {/* Add reject button here if endpoint exists later */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
