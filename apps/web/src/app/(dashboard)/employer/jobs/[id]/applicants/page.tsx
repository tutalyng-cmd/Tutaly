'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import {
  ArrowLeft,
  User,
  FileText,
  Check,
  X,
  Clock,
  Eye,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Link2,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface SeekerProfile {
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  resumeUrl?: string;
  resumeSignedUrl?: string;
  skills?: string[];
  location?: string;
}

interface Applicant {
  id: string;
  status: string;
  coverNote?: string;
  createdAt: string;
  // Application form fields
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  availableFrom?: string;
  coverLetter?: string;
  seeker: {
    id: string;
    email: string;
    seekerProfile?: SeekerProfile;
  };
  job?: {
    id: string;
    currency?: string;
    title?: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  applied: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-700' },
  reviewing: { label: 'Reviewing', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-green-50', text: 'text-green-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700' },
  offered: { label: 'Offered', bg: 'bg-purple-50', text: 'text-purple-700' },
};

export default function ApplicantsPage() {
  const { id: jobId } = useParams();
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Applicant | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetchApplicants() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await apiAuth.withToken(token).get(`/jobs/${jobId}/applicants`);
        setApplicants(res.data);
      } catch (err) {
        console.error('Failed to fetch applicants:', err);
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
      setApplicants((prev) => prev.map((app) => (app.id === appId ? { ...app, status } : app)));
      if (selectedApp?.id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const viewApplicationDetail = async (app: Applicant) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/jobs/${jobId}/applicants/${app.id}`);
      setSelectedApp(res.data);
    } catch (err) {
      console.error('Failed to fetch application details:', err);
      // Fallback to list data
      setSelectedApp(app);
    } finally {
      setDetailLoading(false);
    }
  };

  const getApplicantName = (app: Applicant) => {
    if (app.fullName) return app.fullName;
    const profile = app.seeker?.seekerProfile;
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return app.seeker?.email || 'Unknown';
  };

  const hasResume = (app: Applicant) => {
    return !!(app.seeker?.seekerProfile?.resumeUrl);
  };

  const viewResume = async (app: Applicant) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/jobs/${jobId}/applicants/${app.id}/resume`);
      if (res.data?.signedUrl) {
        window.open(res.data.signedUrl, '_blank');
      } else {
        alert('Could not load resume. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load resume';
      alert(msg);
    }
  };

  // ─── DETAIL VIEW ─────────────────────────────────────
  if (selectedApp) {
    const statusInfo = STATUS_LABELS[selectedApp.status] || {
      label: selectedApp.status,
      bg: 'bg-gray-50',
      text: 'text-gray-700',
    };

    return (
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => setSelectedApp(null)}
          className="text-teal-600 hover:text-teal-900 flex items-center gap-1 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applicants
        </button>

        {detailLoading ? (
          <div className="p-8 text-center text-gray-500 italic">Loading application details...</div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-2xl shrink-0">
                    {getApplicantName(selectedApp).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{getApplicantName(selectedApp)}</h1>
                    <p className="text-gray-500">{selectedApp.email || selectedApp.seeker?.email}</p>
                    {selectedApp.seeker?.seekerProfile?.headline && (
                      <p className="text-sm text-gray-600 mt-1">{selectedApp.seeker.seekerProfile.headline}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        Applied {new Date(selectedApp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex gap-2 shrink-0">
                  {selectedApp.status === 'applied' && (
                    <>
                      <button onClick={() => updateStatus(selectedApp.id, 'reviewing')} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-100 transition">
                        <Eye className="w-4 h-4" /> Review
                      </button>
                      <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition">
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'reviewing' && (
                    <>
                      <button onClick={() => updateStatus(selectedApp.id, 'shortlisted')} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-green-100 transition">
                        <Check className="w-4 h-4" /> Shortlist
                      </button>
                      <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition">
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'shortlisted' && (
                    <>
                      <button onClick={() => updateStatus(selectedApp.id, 'offered')} className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-purple-100 transition">
                        <Clock className="w-4 h-4" /> Offer
                      </button>
                      <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-100 transition">
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Application Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Personal Info & Links */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {(selectedApp.email || selectedApp.seeker?.email) && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <a href={`mailto:${selectedApp.email || selectedApp.seeker?.email}`} className="text-teal-600 hover:text-teal-800">
                          {selectedApp.email || selectedApp.seeker?.email}
                        </a>
                      </div>
                    )}
                    {selectedApp.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-700">{selectedApp.phone}</span>
                      </div>
                    )}
                    {(selectedApp.location || selectedApp.seeker?.seekerProfile?.location) && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-700">{selectedApp.location || selectedApp.seeker?.seekerProfile?.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                {(selectedApp.linkedinUrl || selectedApp.portfolioUrl || selectedApp.githubUrl) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Links</h3>
                    <div className="space-y-3">
                      {selectedApp.linkedinUrl && (
                        <a href={selectedApp.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-teal-600 hover:text-teal-800">
                          <Link2 className="w-4 h-4 shrink-0" /> LinkedIn
                        </a>
                      )}
                      {selectedApp.portfolioUrl && (
                        <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-teal-600 hover:text-teal-800">
                          <Link2 className="w-4 h-4 shrink-0" /> Portfolio
                        </a>
                      )}
                      {selectedApp.githubUrl && (
                        <a href={selectedApp.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-teal-600 hover:text-teal-800">
                          <Link2 className="w-4 h-4 shrink-0" /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Expectations */}
                {(selectedApp.expectedSalary || selectedApp.noticePeriod || selectedApp.availableFrom) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Expectations</h3>
                    <div className="space-y-3">
                      {selectedApp.expectedSalary && (
                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-gray-700">Expected: {selectedApp.job?.currency || 'NGN'} {Number(selectedApp.expectedSalary).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedApp.noticePeriod && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-gray-700">Notice: {selectedApp.noticePeriod}</span>
                        </div>
                      )}
                      {selectedApp.availableFrom && (
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-gray-700">Available from: {selectedApp.availableFrom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {hasResume(selectedApp) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Resume / CV</h3>
                    <button
                      onClick={() => viewResume(selectedApp)}
                      className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-teal-100 transition w-full"
                    >
                      <FileText className="w-5 h-5" /> View / Download Resume
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Professional Background & Cover Letter */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cover Letter */}
                {selectedApp.coverLetter && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Cover Letter</h3>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApp.coverLetter}</div>
                  </div>
                )}

                {/* Experience */}
                {selectedApp.experience && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Work Experience
                    </h3>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApp.experience}</div>
                  </div>
                )}

                {/* Education */}
                {selectedApp.education && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Education
                    </h3>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApp.education}</div>
                  </div>
                )}

                {/* Skills */}
                {selectedApp.skills && selectedApp.skills.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seeker Profile (Platform Profile) */}
                {selectedApp.seeker?.seekerProfile && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> Tutaly Platform Profile
                    </h3>
                    <div className="space-y-3">
                      {selectedApp.seeker.seekerProfile.headline && (
                        <p className="text-sm text-gray-700"><span className="font-medium">Headline:</span> {selectedApp.seeker.seekerProfile.headline}</p>
                      )}
                      {selectedApp.seeker.seekerProfile.bio && (
                        <div>
                          <p className="font-medium text-sm text-gray-700 mb-1">Bio:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedApp.seeker.seekerProfile.bio}</p>
                        </div>
                      )}
                      {selectedApp.seeker.seekerProfile.skills && selectedApp.seeker.seekerProfile.skills.length > 0 && (
                        <div>
                          <p className="font-medium text-sm text-gray-700 mb-2">Profile Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedApp.seeker.seekerProfile.skills.map((skill, i) => (
                              <span key={i} className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── LIST VIEW ─────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/employer/jobs" className="text-teal-600 hover:text-teal-900 flex items-center gap-1 mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500 mt-1">Review candidates and manage their application status. Click on an applicant to see their full application.</p>
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
                <li
                  key={app.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => viewApplicationDetail(app)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-xl shrink-0">
                        {getApplicantName(app).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{getApplicantName(app)}</h3>
                        <p className="text-sm text-gray-500">{app.email || app.seeker?.email}</p>
                        {app.seeker?.seekerProfile?.headline && (
                          <p className="text-xs text-gray-400 mt-0.5">{app.seeker.seekerProfile.headline}</p>
                        )}

                        <div className="mt-3 flex gap-4 text-sm items-center">
                          {hasResume(app) && (
                            <button
                              className="flex items-center gap-1 text-teal-600 font-medium hover:text-teal-800 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewResume(app);
                              }}
                            >
                              <FileText className="w-4 h-4" /> Resume
                            </button>
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

                      {/* Quick action buttons */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {app.status === 'applied' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'reviewing')} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-100 transition">
                              <Eye className="w-3 h-3" /> Review
                            </button>
                            <button onClick={() => updateStatus(app.id, 'rejected')} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition">
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        {app.status === 'reviewing' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'shortlisted')} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-100 transition">
                              <Check className="w-3 h-3" /> Shortlist
                            </button>
                            <button onClick={() => updateStatus(app.id, 'rejected')} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition">
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'offered')} className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-purple-100 transition">
                              <Clock className="w-3 h-3" /> Offer
                            </button>
                            <button onClick={() => updateStatus(app.id, 'rejected')} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition">
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                      </div>

                      {/* View detail indicator */}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        View details <ChevronRight className="w-3 h-3" />
                      </span>
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
