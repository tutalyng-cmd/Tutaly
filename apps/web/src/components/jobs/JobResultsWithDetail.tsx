'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Briefcase, MapPin, Clock, ArrowLeft } from 'lucide-react';
import JobDetailPanel from '@/components/jobs/JobDetailPanel';

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

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

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function JobResultsWithDetail({
  jobs,
  meta,
  selectedJob: initialSelectedJob,
  searchParams: initialSearchParams,
}: {
  jobs: Job[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  selectedJob: Job | null;
  searchParams: Record<string, string>;
}) {
  const urlSearchParams = useSearchParams();
  const [fetchedJob, setFetchedJob] = useState<Job | null>(null);
  const [manualMobileOpen, setManualMobileOpen] = useState(false);

  // Derive selected job from URL without setState in effect
  const jobId = urlSearchParams.get('jobId');
  const selectedJob = useMemo(() => {
    if (!jobId) return null;
    const found = jobs.find((j) => j.id === jobId);
    if (found) return found;
    if (fetchedJob?.id === jobId) return fetchedJob;
    return initialSelectedJob?.id === jobId ? initialSelectedJob : null;
  }, [jobId, jobs, fetchedJob, initialSelectedJob]);

  // Derive mobile detail open from URL or manual override
  const mobileDetailOpen = !!jobId || manualMobileOpen;

  // Only use effect for async API fetch when job not in local list
  const fetchJob = useCallback((id: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/jobs/${id}`)
      .then((res) => res.json())
      .then((data: Job) => {
        setFetchedJob(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (jobId) {
      const found = jobs.find((j) => j.id === jobId);
      if (!found && fetchedJob?.id !== jobId) {
        fetchJob(jobId);
      }
    }
  }, [jobId, jobs, fetchedJob, fetchJob]);

  const handleJobClick = (job: Job) => {
    setFetchedJob(job);
    setManualMobileOpen(true);
  };

  const buildJobUrl = (jobId: string) => {
    const params = new URLSearchParams(initialSearchParams);
    params.set('jobId', jobId);
    return `/jobs?${params.toString()}`;
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(initialSearchParams);
    params.delete('page');
    params.delete('jobId');
    if (page > 1) params.set('page', String(page));
    return `/jobs?${params.toString()}`;
  };

  return (
    <>
      {/* ─── Mobile: Job Detail Full-Screen Overlay ─── */}
      {mobileDetailOpen && selectedJob && (
        <div className="fixed inset-0 bg-c100 z-40 lg:hidden overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-c200 px-4 py-3 flex items-center gap-3 z-10">
            <button
              onClick={() => {
                setManualMobileOpen(false);
                // Update URL to remove jobId
                const params = new URLSearchParams(initialSearchParams);
                params.delete('jobId');
                window.history.replaceState(null, '', `/jobs?${params.toString()}`);
              }}
              className="p-1.5 rounded-lg hover:bg-c100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-c700" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-c900 truncate">{selectedJob.title}</h2>
              <p className="text-xs text-c500 truncate">
                {selectedJob.employer?.email || 'Confidential Company'}
              </p>
            </div>
          </div>
          <div className="p-4">
            <JobDetailPanel job={selectedJob} />
          </div>
        </div>
      )}

      {/* ─── Job List ─── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {jobs.length === 0 ? (
          <div className="bg-c800 border border-c600 rounded-lg p-12 text-center">
            <h3 className="text-lg font-semibold text-c100 mb-2">No jobs found</h3>
            <p className="text-sm text-c400">
              Try loosening your filters or searching with different keywords.
            </p>
          </div>
        ) : (
          jobs.map((job: Job) => {
            const sym = CURRENCY_SYMBOLS[job.currency] || job.currency;
            const isSelected = selectedJob?.id === job.id;
            return (
              <Link
                href={buildJobUrl(job.id)}
                key={job.id}
                scroll={false}
                onClick={(e) => {
                  if (window.innerWidth < 1024) {
                    e.preventDefault();
                    handleJobClick(job);
                    window.history.pushState(null, '', buildJobUrl(job.id));
                  }
                }}
              >
                <div
                  className={`floatcard ${isSelected ? 'border-blueL -translate-x-1' : 'border-c600'} transition-transform duration-200`}
                >
                  <div className="floatcard__logo bg-blue/20 text-blueL">
                    {job.employer?.email ? job.employer.email.substring(0, 1).toUpperCase() : 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="floatcard__title truncate">{job.title}</div>
                    <div className="floatcard__company truncate">
                      {job.employer?.email || 'Confidential Company'}
                    </div>
                    <div className="floatcard__meta">
                      {job.minSalary && (
                        <span className="floatcard__salary">
                          {sym}{job.minSalary.toLocaleString()}
                          {job.maxSalary ? `–${sym}${job.maxSalary.toLocaleString()}` : '+'}
                        </span>
                      )}
                      <span className="floatcard__tag">{job.workMode}</span>
                      <span className="floatcard__tag">{job.jobType}</span>
                      {job.isFeatured && <span className="floatcard__new bg-gold/20 text-goldH">Featured</span>}
                      {job.isUrgent && <span className="floatcard__new bg-red/10 text-red">Urgent</span>}
                      <span className="text-xs text-c500 ml-auto">
                        {formatTimeAgo(job.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map(
              (page) => {
                const isActive = String(meta.page) === String(page) || (!initialSearchParams.page && page === 1);
                return (
                  <Link
                    key={page}
                    href={buildPageUrl(page)}
                    className={`btn px-3.5 py-2 rounded-md ${isActive ? 'bg-blue text-white border-blue' : 'bg-c800 text-c200 border-c600'}`}
                  >
                    {page}
                  </Link>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ─── Desktop: Detail Panel (side) ─── */}
      <div className="hidden lg:block lg:w-96 xl:w-layout-md shrink-0">
        <div className="sticky top-8">
          <JobDetailPanel job={selectedJob} />
        </div>
      </div>
    </>
  );
}
