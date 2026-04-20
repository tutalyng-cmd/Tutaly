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
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-gray-400 text-center">
        <Briefcase className="w-12 h-12 mb-4 text-gray-300" />
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
          <p className="text-sm text-gray-500">{job.employer?.email || 'Confidential Company'}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
              <Briefcase className="w-3 h-3" /> {job.jobType}
            </span>
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
              {job.workMode}
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
              {job.experienceLevel}
            </span>
            {job.isFeatured && (
              <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            {job.isUrgent && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                Urgent
              </span>
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {job.area ? `${job.area}, ` : ''}
              {job.state}, {job.country}
            </div>
            {job.minSalary && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-800">
                  {sym}
                  {job.minSalary.toLocaleString()}
                  {job.maxSalary ? ` – ${sym}${job.maxSalary.toLocaleString()}` : '+'}
                </span>
                <span className="text-xs text-gray-400">/ month</span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Description
          </h3>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6">
          {applied ? (
            <div className="w-full bg-green-50 text-green-700 font-bold py-3.5 px-4 rounded-xl text-center border border-green-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Application Submitted
            </div>
          ) : (
            <button
              onClick={handleApplyClick}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-3.5 px-4 rounded-xl hover:from-black hover:to-gray-900 transition shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Apply Now
            </button>
          )}

          <div className="flex gap-3 mt-3">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-xl border transition ${
                saved
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200'
              }`}
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
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium text-gray-400 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-500 border border-gray-200 transition"
            >
              <Flag className="w-4 h-4" /> Report
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
