import React, { Suspense } from 'react';
import JobFilterSidebar from '@/components/jobs/JobFilterSidebar';
import JobResultsWithDetail from '@/components/jobs/JobResultsWithDetail';

interface Job {
  id: string;
  title: string;
  description: string;
  industry: string;
  role: string;
  jobType: string;
  experienceLevel: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  country: string;
  state: string;
  area?: string;
  workMode: string;
  isFeatured: boolean;
  isUrgent: boolean;
  deadline?: string;
  createdAt: string;
  employer?: { id: string; email: string };
}

async function fetchJobs(searchParams: { [key: string]: string | string[] | undefined }) {
  const query = new URLSearchParams();
  Object.keys(searchParams).forEach((key) => {
    if (searchParams[key] && key !== 'jobId') query.append(key, String(searchParams[key]));
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/jobs?${query.toString()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { items: [] as Job[], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    return await res.json();
  } catch {
    return { items: [] as Job[], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }
}

async function fetchJobDetail(jobId: string): Promise<Job | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/jobs/${jobId}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function JobsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { items: jobs, meta } = await fetchJobs(searchParams);
  const selectedJobId = searchParams.jobId ? String(searchParams.jobId) : null;

  // Fetch full detail for selected job
  let selectedJob: Job | null = null;
  if (selectedJobId) {
    selectedJob = jobs.find((j: Job) => j.id === selectedJobId) || await fetchJobDetail(selectedJobId);
  }

  // Build clean searchParams object for child component
  const cleanParams: Record<string, string> = {};
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v !== undefined && k !== 'jobId') cleanParams[k] = String(v);
  });

  return (
    <div className="bg-gray-50 min-h-screen pt-6 sm:pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Your Next Role</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
            Showing {meta?.total || 0} active job{meta?.total !== 1 ? 's' : ''}
            {searchParams.keyword ? ` for "${searchParams.keyword}"` : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <Suspense fallback={<div className="w-full lg:w-72 h-32 animate-pulse bg-gray-200 rounded-xl" />}>
            <JobFilterSidebar />
          </Suspense>

          <Suspense fallback={<div className="flex-1 h-64 animate-pulse bg-gray-200 rounded-xl" />}>
            <JobResultsWithDetail
              jobs={jobs}
              meta={meta}
              selectedJob={selectedJob}
              searchParams={cleanParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
