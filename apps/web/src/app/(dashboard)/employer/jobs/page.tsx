'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Plus, Users, Clock, CheckCircle } from 'lucide-react';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchJobs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
                      <div className="font-medium text-gray-900">{job.title}</div>
                      <div className="text-gray-500">{job.jobType} · {job.workMode}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {job.area ? `${job.area}, ` : ''}{job.state}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {job.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : job.status === 'PENDING_REVIEW' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          <Clock className="w-3 h-3" /> Pending Review
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
                      <Link href={`/employer/jobs/${job.id}/applicants`} className="text-teal-600 hover:text-teal-900 flex items-center justify-end gap-1">
                        <Users className="w-4 h-4" /> View Applicants
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
