import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import JobFilterSidebar from '@/components/jobs/JobFilterSidebar';
import JobResultsWithDetail from '@/components/jobs/JobResultsWithDetail';
import FeaturedJobsCarousel from '@/components/ads/FeaturedJobsCarousel';
import SidebarAd from '@/components/ads/SidebarAd';
import { serverFetch } from '@/lib/server-fetch';

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

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const keyword = searchParams.keyword ? String(searchParams.keyword) : '';
  const location = searchParams.location ? String(searchParams.location) : '';
  
  let title = "Job Search";
  if (keyword && location) title = `${keyword} jobs in ${location}`;
  else if (keyword) title = `${keyword} jobs`;
  else if (location) title = `Jobs in ${location}`;

  return {
    title,
    description: `Find your next role on Tutaly. Browse thousands of active job listings${location ? ` in ${location}` : ''}.`,
  };
}

async function fetchJobs(searchParams: { [key: string]: string | string[] | undefined }) {
  const query = new URLSearchParams();
  Object.keys(searchParams).forEach((key) => {
    if (searchParams[key] && key !== 'jobId') query.append(key, String(searchParams[key]));
  });

  try {
    const data = await serverFetch<any>(`jobs?${query.toString()}`, { cache: 'no-store' });
    return { items: data?.items || [], meta: data?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 } };
  } catch (err) {
    return { items: [] as Job[], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }
}

async function fetchJobDetail(jobId: string): Promise<Job | null> {
  try {
    return await serverFetch<Job>(`jobs/${jobId}`, { cache: 'no-store' });
  } catch (err) {
    return null;
  }
}

export default async function JobsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  // Fetch jobs and filter metadata in parallel
  const [{ items: jobs, meta }, filterMetaRes] = await Promise.all([
    fetchJobs(searchParams),
    serverFetch<any>('jobs/meta/filters', { cache: 'no-store' }).catch(() => null)
  ]);
  
  const filterMeta = filterMetaRes || { industries: [], locations: {} };
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
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Job board</div>
          <h1 className="page-header__title">Find Your Next Role</h1>
          <p className="page-header__sub">
            Showing {meta?.total || 0} active job{meta?.total !== 1 ? 's' : ''}
            {searchParams.keyword ? ` for "${searchParams.keyword}"` : ''}
          </p>
          
          <div className="hero__search" role="search" aria-label="Job search" style={{ marginTop: '20px', maxWidth: '100%' }}>
            <div className="hero__search-field">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Job title, skills, or company..." aria-label="Search jobs" defaultValue={searchParams.keyword as string || ''} />
            </div>
            <div className="hero__search-loc" aria-label={`Location: ${searchParams.location || 'All locations'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {searchParams.location || 'All locations'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <button className="hero__search-btn">Search</button>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ marginTop: '32px' }}>
          <FeaturedJobsCarousel />
        </div>

        <div className="layout-split">
          <Suspense fallback={<div className="w-72 h-32 bg-c800 rounded-lg animate-pulse hidden lg:block" />}>
            <div className="flex flex-col gap-6">
              <JobFilterSidebar filterMeta={filterMeta} />
              <SidebarAd placement="jobs_sidebar" />
            </div>
          </Suspense>

          <Suspense fallback={
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-c800 rounded-lg animate-pulse" />
              ))}
            </div>
          }>
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
