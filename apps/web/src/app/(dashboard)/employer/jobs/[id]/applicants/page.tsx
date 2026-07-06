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
  applied: { label: 'Applied', bg: 'bg-blueL', text: 'text-blueH' },
  reviewing: { label: 'Reviewing', bg: 'bg-gold', text: 'text-goldH' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-green', text: 'text-green' },
  rejected: { label: 'Rejected', bg: 'bg-red', text: 'text-red' },
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
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
const msg = err?.response?.data?.message || 'Failed to load resume';
      alert(msg);
    }
  };

  // ─── DETAIL VIEW ─────────────────────────────────────
  if (selectedApp) {
    const statusInfo = STATUS_LABELS[selectedApp.status] || {
      label: selectedApp.status,
      bg: 'bg-c100',
      text: 'text-c700',
    };

    return (
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => setSelectedApp(null)}
          className="text-green hover:text-green flex items-center gap-1 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applicants
        </button>

        {detailLoading ? (
          <div className="p-8 text-center text-c500 italic">Loading application details...</div>
        ) : (
          <>
            {/* Header */}
            <div className="dcard mb-6 p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center text-green font-bold text-2xl shrink-0" style={{ background: 'var(--green-light)' }}>
                    {getApplicantName(selectedApp).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-c100">{getApplicantName(selectedApp)}</h1>
                    <p className="text-c400">{selectedApp.email || selectedApp.seeker?.email}</p>
                    {selectedApp.seeker?.seekerProfile?.headline && (
                      <p className="text-sm text-c500 mt-1">{selectedApp.seeker.seekerProfile.headline}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-c500">
                        Applied {new Date(selectedApp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex gap-2 shrink-0">
                  {selectedApp.status === 'applied' && (
                    <>
                      <button onClick={() => updateStatus(selectedApp.id, 'reviewing')} className="btn btn--sm btn--primary" style={{ border: 'none' }}>
                        <Eye className="w-4 h-4" /> Review
                      </button>
                      <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="btn btn--sm btn--danger-outline">
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'reviewing' && (
                    <>
                      <button onClick={() => updateStatus(selectedApp.id, 'shortlisted')} className="btn btn--sm" style={{ background: 'var(--green-light)', color: 'var(--green)', border: 'none' }}>
                        <Check className="w-4 h-4" /> Shortlist
                      </button>
                      <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="btn btn--sm btn--danger-outline">
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'shortlisted' && (
                    <>
                      <button onClick={() => updateStatus(selectedApp.id, 'offered')} className="btn btn--sm" style={{ background: 'var(--gold-light)', color: 'var(--gold-h)', border: 'none' }}>
                        <Clock className="w-4 h-4" /> Offer
                      </button>
                      <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="btn btn--sm btn--danger-outline">
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
                <div className="dcard p-6">
                  <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {(selectedApp.email || selectedApp.seeker?.email) && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-c400 shrink-0" />
                        <a href={`mailto:${selectedApp.email || selectedApp.seeker?.email}`} className="text-blue-l hover:underline">
                          {selectedApp.email || selectedApp.seeker?.email}
                        </a>
                      </div>
                    )}
                    {selectedApp.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-c400 shrink-0" />
                        <span className="text-c300">{selectedApp.phone}</span>
                      </div>
                    )}
                    {(selectedApp.location || selectedApp.seeker?.seekerProfile?.location) && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-c400 shrink-0" />
                        <span className="text-c300">{selectedApp.location || selectedApp.seeker?.seekerProfile?.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                {(selectedApp.linkedinUrl || selectedApp.portfolioUrl || selectedApp.githubUrl) && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4">Links</h3>
                    <div className="space-y-3">
                      {selectedApp.linkedinUrl && (
                        <a href={selectedApp.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-blue-l hover:underline">
                          <Link2 className="w-4 h-4 shrink-0" /> LinkedIn
                        </a>
                      )}
                      {selectedApp.portfolioUrl && (
                        <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-blue-l hover:underline">
                          <Link2 className="w-4 h-4 shrink-0" /> Portfolio
                        </a>
                      )}
                      {selectedApp.githubUrl && (
                        <a href={selectedApp.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-blue-l hover:underline">
                          <Link2 className="w-4 h-4 shrink-0" /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Expectations */}
                {(selectedApp.expectedSalary || selectedApp.noticePeriod || selectedApp.availableFrom) && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4">Expectations</h3>
                    <div className="space-y-3">
                      {selectedApp.expectedSalary && (
                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-c400 shrink-0" />
                          <span className="text-c300 font-mono">Expected: {selectedApp.job?.currency || 'NGN'} {Number(selectedApp.expectedSalary).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedApp.noticePeriod && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-4 h-4 text-c400 shrink-0" />
                          <span className="text-c300">Notice: {selectedApp.noticePeriod}</span>
                        </div>
                      )}
                      {selectedApp.availableFrom && (
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-c400 shrink-0" />
                          <span className="text-c300">Available from: {selectedApp.availableFrom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {hasResume(selectedApp) && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4">Resume / CV</h3>
                    <button
                      onClick={() => viewResume(selectedApp)}
                      className="btn btn--full"
                    >
                      <FileText className="w-4 h-4" /> View / Download Resume
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Professional Background & Cover Letter */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cover Letter */}
                {selectedApp.coverLetter && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4">Cover Letter</h3>
                    <div className="text-sm text-c300 leading-relaxed whitespace-pre-wrap">{selectedApp.coverLetter}</div>
                  </div>
                )}

                {/* Experience */}
                {selectedApp.experience && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-c400" /> Work Experience
                    </h3>
                    <div className="text-sm text-c300 leading-relaxed whitespace-pre-wrap">{selectedApp.experience}</div>
                  </div>
                )}

                {/* Education */}
                {selectedApp.education && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-c400" /> Education
                    </h3>
                    <div className="text-sm text-c300 leading-relaxed whitespace-pre-wrap">{selectedApp.education}</div>
                  </div>
                )}

                {/* Skills */}
                {selectedApp.skills && selectedApp.skills.length > 0 && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.skills.map((skill, i) => (
                        <span key={i} className="skill-chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seeker Profile (Platform Profile) */}
                {selectedApp.seeker?.seekerProfile && (
                  <div className="dcard p-6">
                    <h3 className="text-sm font-semibold text-c100 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-c400" /> Tutaly Platform Profile
                    </h3>
                    <div className="space-y-3">
                      {selectedApp.seeker.seekerProfile.headline && (
                        <p className="text-sm text-c300"><span className="font-medium text-c100">Headline:</span> {selectedApp.seeker.seekerProfile.headline}</p>
                      )}
                      {selectedApp.seeker.seekerProfile.bio && (
                        <div>
                          <p className="font-medium text-sm text-c100 mb-1">Bio:</p>
                          <p className="text-sm text-c300 whitespace-pre-wrap">{selectedApp.seeker.seekerProfile.bio}</p>
                        </div>
                      )}
                      {selectedApp.seeker.seekerProfile.skills && selectedApp.seeker.seekerProfile.skills.length > 0 && (
                        <div>
                          <p className="font-medium text-sm text-c100 mb-2">Profile Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedApp.seeker.seekerProfile.skills.map((skill, i) => (
                              <span key={i} className="skill-chip">
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
  const applied = applicants.filter(a => a.status === 'applied');
  const reviewing = applicants.filter(a => a.status === 'reviewing');
  const shortlisted = applicants.filter(a => a.status === 'shortlisted');
  const offered = applicants.filter(a => a.status === 'offered');
  const rejected = applicants.filter(a => a.status === 'rejected');

  const jobTitle = applicants.length > 0 && applicants[0].job?.title ? applicants[0].job.title : 'Job Applicants';

  const renderCard = (app: Applicant) => (
    <div key={app.id} className="kanban-card cursor-pointer hover:border-c400 transition" onClick={() => viewApplicationDetail(app)}>
      <div className="kanban-card__head">
        <div className="kanban-card__avatar" style={{ background: 'var(--c-500)' }}>
          {getApplicantName(app).charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="kanban-card__name">{getApplicantName(app)}</div>
          <div className="kanban-card__role">{app.location || app.seeker?.seekerProfile?.location || 'Unknown Location'}</div>
        </div>
      </div>
      <div className="kanban-card__meta mt-2">
        <span className="kanban-card__date">{new Date(app.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4">
        <Link href="/employer/jobs" className="text-c400 hover:text-c100 flex items-center gap-1 mb-4 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>

      <div className="dcard" style={{ marginBottom: '16px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--c-100)' }}>{jobTitle}</div>
            <div style={{ fontSize: '12px', color: 'var(--c-500)', marginTop: '2px' }}>
              {applicants.length} total applicant{applicants.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={`/employer/jobs/${jobId}/edit`} className="btn btn--ghost btn--sm">Edit job post</Link>
            <Link href={`/jobs/${jobId}`} className="btn btn--ghost btn--sm">View public listing</Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-c500 italic">Finding candidates...</div>
      ) : applicants.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty__icon">
            <User className="w-6 h-6 text-c400" />
          </div>
          <div className="dash-empty__title">No applicants yet</div>
          <div className="dash-empty__desc">When job seekers apply to this position, they will appear here.</div>
        </div>
      ) : (
        <div className="kanban">
          {/* New / Applied */}
          <div className="kanban-col">
            <div className="kanban-col__head">
              <span className="kanban-col__title">New</span>
              <span className="kanban-col__count">{applied.length}</span>
            </div>
            {applied.map(renderCard)}
          </div>

          {/* Screening / Reviewing */}
          <div className="kanban-col">
            <div className="kanban-col__head">
              <span className="kanban-col__title">Screening</span>
              <span className="kanban-col__count">{reviewing.length}</span>
            </div>
            {reviewing.map(renderCard)}
          </div>

          {/* Interview / Shortlisted */}
          <div className="kanban-col">
            <div className="kanban-col__head">
              <span className="kanban-col__title">Interview</span>
              <span className="kanban-col__count">{shortlisted.length}</span>
            </div>
            {shortlisted.map(renderCard)}
          </div>

          {/* Offer / Offered */}
          <div className="kanban-col">
            <div className="kanban-col__head">
              <span className="kanban-col__title">Offer</span>
              <span className="kanban-col__count">{offered.length}</span>
            </div>
            {offered.map(renderCard)}
          </div>

          {/* Not selected / Rejected */}
          <div className="kanban-col">
            <div className="kanban-col__head">
              <span className="kanban-col__title">Not selected</span>
              <span className="kanban-col__count">{rejected.length}</span>
            </div>
            <div style={{ opacity: 0.6 }}>
              {rejected.map(renderCard)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
