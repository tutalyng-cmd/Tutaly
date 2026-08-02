'use client';

import { toast } from 'react-hot-toast';

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
import { motion } from 'framer-motion';
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
  employer?: { id: string; email: string; companyName?: string };
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
          toast.error('Employers cannot apply to jobs. Please sign in as a job seeker.');
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
      toast.error('Could not save this job. You may have already saved it.');
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
      toast.success('Thank you. Your report has been submitted for review.');
    } catch {
      toast.error('Could not submit report. Please try again.');
    }
  };

  return (
    <>
      <motion.div 
        key={job.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl border border-c200 overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="p-8 border-b border-c200 bg-c50/50 backdrop-blur-sm">
          <h2 className="text-2xl font-extrabold text-c900 mb-1">{job.title}</h2>
          <p className="text-sm font-medium text-c500">{job.employer?.companyName || 'Confidential Company'}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="tag bg-blue/10 text-blue font-semibold">
              <Briefcase className="w-3.5 h-3.5" /> {job.jobType}
            </span>
            <span className="tag bg-green/10 text-green font-semibold">
              {job.workMode}
            </span>
            <span className="tag bg-c100 text-c700 font-semibold">
              {job.experienceLevel}
            </span>
            {job.isFeatured && (
              <span className="tag bg-gold/10 text-gold font-semibold">
                Featured
              </span>
            )}
            {job.isUrgent && (
              <span className="tag bg-red/10 text-red font-semibold">
                Urgent
              </span>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-c600">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-c400" />
              <span>
                {job.area ? `${job.area}, ` : ''}
                {job.state}, {job.country}
              </span>
            </div>
            {job.minSalary && (
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-c400" />
                <span className="font-mono font-medium text-green">
                  {sym}{job.minSalary.toLocaleString()}
                  {job.maxSalary ? ` – ${sym}${job.maxSalary.toLocaleString()}` : '+'}
                  <span className="text-xs text-c400 ml-1">/ month</span>
                </span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-c400" />
                <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-c400" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-8 border-b border-c200">
          <h3 className="text-sm font-bold text-c900 uppercase tracking-widest mb-4">
            Description
          </h3>
          <div className="text-base text-c600 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 bg-c50">
          {applied ? (
            <div className="w-full bg-green/10 text-green font-bold p-4 rounded-xl text-center border border-green/20 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Application Submitted
            </div>
          ) : (
            <button
              onClick={handleApplyClick}
              className="btn btn--primary btn--lg w-full premium-hover"
            >
              <Send className="w-4 h-4" />
              Apply Now
            </button>
          )}

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`btn flex-1 premium-hover ${saved ? 'bg-blue/10 text-blue border-blue/20 pointer-events-none' : 'btn--secondary'}`}
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
              className="btn btn--ghost shrink-0 p-4 premium-hover"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

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
