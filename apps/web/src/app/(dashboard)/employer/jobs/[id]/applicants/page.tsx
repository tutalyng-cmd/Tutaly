'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import { ArrowLeft, User, FileText, Check, X, Clock, Eye } from 'lucide-react';

interface Applicant {
  id: string;
  status: string;
  coverNote?: string;
  createdAt: string;
  seeker: {
    email: string;
    seekerProfile?: {
      firstName?: string;
      lastName?: string;
      resumeUrl?: string;
    };
  };
}

// Map backend enum values to display labels
const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  applied: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-700' },
  reviewing: { label: 'Reviewing', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-green-50', text: 'text-green-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700' },
  offered: { label: 'Offered', bg: 'bg-purple-50', text: 'text-purple-700' },
};

export default function ApplicantsPage() {
  const { id: jobId } = useParams();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplicants() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await apiAuth.withToken(token).get(`/jobs/${jobId}/applicants`);
        setApplicants(res.data);
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (appId: string, status: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch(`/jobs/${jobId}/applicants/${appId}`, { status });
      // Optimistic UI update
      setApplicants(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
    } catch {
      alert('Failed to update status');
    }
  };

  const getApplicantName = (app: Applicant) => {
    const profile = app.seeker?.seekerProfile;
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return app.seeker?.email || 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/employer/jobs" className="text-teal-600 hover:text-teal-900 flex items-center gap-1 mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500 mt-1">Review candidates and manage their application status.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 italic">Finding candidates...</div>
        ) : applicants.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants yet</h3>
            <p className="text-sm">When job seekers apply to this position, they will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applicants.map((app) => {
              const statusInfo = STATUS_LABELS[app.status] || { label: app.status, bg: 'bg-gray-50', text: 'text-gray-700' };

              return (
                <li key={app.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-xl shrink-0">
                        {getApplicantName(app).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{getApplicantName(app)}</h3>
                        <p className="text-sm text-gray-500">{app.seeker?.email}</p>
                        {app.coverNote && (
                          <p className="text-sm text-gray-500 mt-2 max-w-2xl italic">&ldquo;{app.coverNote}&rdquo;</p>
                        )}

                        <div className="mt-3 flex gap-4 text-sm">
                          {app.seeker?.seekerProfile?.resumeUrl && (
                            <a href={app.seeker.seekerProfile.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium">
                              <FileText className="w-4 h-4" /> View Resume
                            </a>
                          )}
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>

                      {/* Action buttons based on current status */}
                      {(app.status === 'applied') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(app.id, 'reviewing')}
                            className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-100 transition"
                          >
                            <Eye className="w-4 h-4" /> Review
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'rejected')}
                            className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}

                      {app.status === 'reviewing' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(app.id, 'shortlisted')}
                            className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-green-100 transition"
                          >
                            <Check className="w-4 h-4" /> Shortlist
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'rejected')}
                            className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}

                      {app.status === 'shortlisted' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(app.id, 'offered')}
                            className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-purple-100 transition"
                          >
                            <Clock className="w-4 h-4" /> Offer
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'rejected')}
                            className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
