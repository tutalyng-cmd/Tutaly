'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <AnimatePresence>
        {mobileDetailOpen && selectedJob && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-c100 z-50 lg:hidden overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-c200 px-4 py-3 flex items-center gap-3 z-10 shadow-sm">
              <button
                onClick={() => {
                  setManualMobileOpen(false);
                  // Update URL to remove jobId
                  const params = new URLSearchParams(initialSearchParams);
                  params.delete('jobId');
                  window.history.replaceState(null, '', `/jobs?${params.toString()}`);
                }}
                className="p-1.5 rounded-lg hover:bg-c100 transition premium-hover"
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
            <div className="p-4 pb-20">
              <JobDetailPanel job={selectedJob} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* ─── Job List ─── */}
        <main aria-label="Job results" className="flex-1 min-w-0 w-full">
          <div className="results-bar">
            <p className="results-count"><strong>{meta?.total || 0}</strong> jobs found</p>
            <div className="results-sort">
              Sort by
              <select aria-label="Sort jobs by" defaultValue="Most relevant">
                <option>Most relevant</option>
                <option>Newest first</option>
                <option>Highest salary</option>
              </select>
            </div>
          </div>

          <div className="joblist">
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
                  <article className={`jobcard premium-hover ${isSelected ? 'border-blue shadow-md' : ''}`}>
                    <div className="jobcard__logo bg-blue/10 text-blue font-bold">
                      {job.employer?.email ? job.employer.email.substring(0, 1).toUpperCase() : 'C'}
                    </div>
                    <div className="jobcard__body">
                      <div className="jobcard__top">
                        <div>
                          <div className="jobcard__title">{job.title}</div>
                          <div className="jobcard__company">
                            {job.employer?.email || 'Confidential Company'}
                          </div>
                        </div>
                        <button className="jobcard__save premium-hover hover:text-blue hover:bg-blue/10 p-2 rounded-full transition-colors" aria-label="Save job" onClick={(e) => e.preventDefault()}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                        </button>
                      </div>
                      
                      <div className="jobcard__meta">
                        <span>📍 {job.area ? `${job.area}, ` : ''}{job.state}, {job.country}</span>
                        <span>🏢 {job.workMode}</span>
                        <span>👤 {job.experienceLevel}</span>
                      </div>

                      {job.minSalary && (
                        <div className="jobcard__salary font-mono text-green font-medium">
                          {sym}{job.minSalary.toLocaleString()}
                          {job.maxSalary ? ` – ${sym}${job.maxSalary.toLocaleString()}` : '+'} / month
                        </div>
                      )}

                      <div className="jobcard__tags">
                        <span className="badge badge--new">{job.industry || 'Tech'}</span>
                        <span className="badge badge--new">{job.jobType}</span>
                        {job.isFeatured && <span className="tag tag--gold">Featured</span>}
                        {job.isUrgent && <span className="tag bg-red/10 text-red">Urgent</span>}
                      </div>
                      
                      <div className="jobcard__footer">
                        <span className="jobcard__posted text-c400">Posted {formatTimeAgo(job.createdAt)}</span>
                        <button className="btn btn--primary btn--sm premium-hover" onClick={(e) => e.preventDefault()}>Apply Now</button>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })
          )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <nav className="pagination" aria-label="Job results pages">
              <Link 
                href={buildPageUrl(meta.page - 1)} 
                className={`page-btn ${meta.page <= 1 ? 'pointer-events-none opacity-40' : ''}`} 
                aria-label="Previous page"
                aria-disabled={meta.page <= 1}
              >
                ‹
              </Link>
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                const pageNum = Math.max(1, meta.page - 2) + i;
                if (pageNum > meta.totalPages) return null;
                
                const isActive = String(meta.page) === String(pageNum) || (!initialSearchParams.page && pageNum === 1);
                return (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={`page-btn ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              {meta.totalPages > 5 && meta.page < meta.totalPages - 2 && (
                <>
                  <span style={{ color: 'var(--c-500)', padding: '0 4px' }}>…</span>
                  <Link href={buildPageUrl(meta.totalPages)} className="page-btn">{meta.totalPages}</Link>
                </>
              )}
              <Link 
                href={buildPageUrl(meta.page + 1)} 
                className={`page-btn ${meta.page >= meta.totalPages ? 'pointer-events-none opacity-40' : ''}`} 
                aria-label="Next page"
                aria-disabled={meta.page >= meta.totalPages}
              >
                ›
              </Link>
            </nav>
          )}
        </main>

        {/* ─── Desktop: Job Detail Panel ─── */}
        <aside className="hidden lg:block shrink-0 sticky top-24 pb-8" style={{ width: '450px' }}>
          {selectedJob ? (
            <JobDetailPanel job={selectedJob} />
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-c200 flex flex-col items-center justify-center text-center" style={{ minHeight: '500px' }}>
              <div className="w-16 h-16 bg-c100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-c400" />
              </div>
              <h3 className="text-lg font-bold text-c900 mb-2">Select a job</h3>
              <p className="text-c500 leading-relaxed" style={{ maxWidth: '250px' }}>
                Click on any listing on the left to see the full description and apply.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
