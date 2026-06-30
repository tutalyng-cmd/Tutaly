'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Send,
  Bookmark,
  Flag,
  CheckCircle2,
} from 'lucide-react';
import { apiAuth } from '@/lib/api';
import ApplyModal from './ApplyModal';

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

export default function JobDetailPanel({ job }: { job: Job | null }) {
  const router = useRouter();
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  if (!job) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-c100 min-h-layout-lg flex flex-col items-center justify-center text-c400 text-center">
        <Briefcase className="w-12 h-12 mb-4 text-c300" />
        <p className="font-medium">Select a job to view details</p>
        <p className="text-sm mt-1">Click on any listing to see the full description and apply.</p>
      </div>
    );
  }

  const sym = CURRENCY_SYMBOLS[job.currency] || job.currency;

  const handleApplyClick = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      const returnUrl = encodeURIComponent(`/jobs?jobId=${job.id}`);
      router.push(`/auth/signin?returnUrl=${returnUrl}`);
      return;
    }

    // Check if user is a seeker (from stored user obj)
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'employer') {
          alert('Employers cannot apply to jobs. Please sign in as a job seeker.');
          return;
        }
      }
    } catch {
      // ignore parse errors
    }

    setShowApplyModal(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(`/jobs?jobId=${job.id}`)}`);
      return;
    }
    try {
      await apiAuth.withToken(token).post(`/jobs/${job.id}/save`);
      setSaved(true);
    } catch {
      alert('Could not save this job. You may have already saved it.');
    }
  };

  const handleReport = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push(`/auth/signin`);
      return;
    }

    const reason = prompt('Please describe why you are reporting this job listing:');
    if (!reason || reason.trim().length === 0) return;

    try {
      await apiAuth.withToken(token).post(`/jobs/${job.id}/report`, { reason: reason.trim() });
      alert('Thank you. Your report has been submitted for review.');
    } catch {
      alert('Could not submit report. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-c800 rounded-xl border border-c700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-c700">
          <h2 className="text-xl font-extrabold text-c100 mb-1">{job.title}</h2>
          <p className="text-sm text-c400">{job.employer?.email || 'Confidential Company'}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="tag tag--blue">
              <Briefcase className="w-3 h-3" /> {job.jobType}
            </span>
            <span className="tag tag--green">
              {job.workMode}
            </span>
            <span className="tag bg-c700 text-c200">
              {job.experienceLevel}
            </span>
            {job.isFeatured && (
              <span className="tag tag--gold">
                Featured
              </span>
            )}
            {job.isUrgent && (
              <span className="tag bg-red/10 text-red">
                Urgent
              </span>
            )}
          </div>

          <div className="mt-6 space-y-3 text-sm text-c300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-c500" />
              {job.area ? `${job.area}, ` : ''}
              {job.state}, {job.country}
            </div>
            {job.minSalary && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-c500" />
                <span className="font-medium text-green font-mono">
                  {sym}
                  {job.minSalary.toLocaleString()}
                  {job.maxSalary ? ` – ${sym}${job.maxSalary.toLocaleString()}` : '+'}
                </span>
                <span className="text-xs text-c500">/ month</span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-c500" />
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-c500" />
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-c700">
          <h3 className="text-xs font-bold text-c100 uppercase tracking-widest mb-3">
            Description
          </h3>
          <div className="text-sm text-c300 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6">
          {applied ? (
            <div className="w-full bg-green/20 text-green font-bold p-3.5 rounded-md text-center border border-green/30 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Application Submitted
            </div>
          ) : (
            <button
              onClick={handleApplyClick}
              className="btn btn--primary btn--lg w-full"
            >
              <Send className="w-4 h-4" />
              Apply Now
            </button>
          )}

          <div className="flex gap-3 mt-3">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`btn flex-1 ${saved ? 'bg-blue/20 text-blueL border-blue' : 'btn--ghost'}`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" /> Save
                </>
              )}
            </button>
            <button
              onClick={handleReport}
              className="btn btn--ghost shrink-0 p-3"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setApplied(true);
            setShowApplyModal(false);
          }}
        />
      )}
    </>
  );
}
