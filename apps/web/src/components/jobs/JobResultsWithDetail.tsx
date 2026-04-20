'use client';

import React, { useState, useEffect } from 'react';
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(initialSelectedJob);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(!!initialSelectedJob);

  // Sync when URL changes
  useEffect(() => {
    const jobId = urlSearchParams.get('jobId');
    if (jobId) {
      const found = jobs.find((j) => j.id === jobId);
      if (found) {
        setSelectedJob(found);
        setMobileDetailOpen(true);
      } else {
        // Fetch from API
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/jobs/${jobId}`)
          .then((res) => res.json())
          .then((data) => {
            setSelectedJob(data);
            setMobileDetailOpen(true);
          })
          .catch(() => {});
      }
    } else {
      setSelectedJob(null);
      setMobileDetailOpen(false);
    }
  }, [urlSearchParams, jobs]);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setMobileDetailOpen(true);
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
        <div className="fixed inset-0 bg-gray-50 z-40 lg:hidden overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
            <button
              onClick={() => {
                setMobileDetailOpen(false);
                // Update URL to remove jobId
                const params = new URLSearchParams(initialSearchParams);
                params.delete('jobId');
                window.history.replaceState(null, '', `/jobs?${params.toString()}`);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 truncate">{selectedJob.title}</h2>
              <p className="text-xs text-gray-500 truncate">
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
      <div className="flex-1 min-w-0 space-y-3">
        {jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <h3 className="font-medium text-gray-900 mb-1">No jobs found</h3>
            <p className="text-sm text-gray-500">
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
                  // On mobile, prevent navigation and handle inline
                  if (window.innerWidth < 1024) {
                    e.preventDefault();
                    handleJobClick(job);
                    window.history.pushState(null, '', buildJobUrl(job.id));
                  }
                }}
              >
                <div
                  className={`bg-white p-4 sm:p-5 rounded-xl border transition cursor-pointer hover:shadow-md mb-3 ${
                    isSelected
                      ? 'border-teal-500 shadow-md ring-1 ring-teal-500'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                        {job.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {job.employer?.email || 'Confidential Company'}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 ml-2">
                      {job.isFeatured && (
                        <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {job.isUrgent && (
                        <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 sm:gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.area ? `${job.area}, ` : ''}
                      {job.state || job.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.jobType}
                    </div>
                    {job.minSalary && (
                      <div className="font-medium text-gray-800">
                        {sym}
                        {job.minSalary.toLocaleString()}
                        {job.maxSalary
                          ? ` - ${sym}${job.maxSalary.toLocaleString()}`
                          : '+'}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-400 ml-auto">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(job.createdAt)}
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
              (page) => (
                <Link
                  key={page}
                  href={buildPageUrl(page)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    String(meta.page) === String(page) ||
                    (!initialSearchParams.page && page === 1)
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Link>
              )
            )}
          </div>
        )}
      </div>

      {/* ─── Desktop: Detail Panel (side) ─── */}
      <div className="hidden lg:block lg:w-[380px] xl:w-[420px] shrink-0">
        <div className="sticky top-8">
          <JobDetailPanel job={selectedJob} />
        </div>
      </div>
    </>
  );
}
