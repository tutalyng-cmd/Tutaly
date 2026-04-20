'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  X,
  Upload,
  FileText,
  User,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Briefcase,
  GraduationCap,
  Link2,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Globe,
  Sparkles,
  Eye,
} from 'lucide-react';
import { apiAuth } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  employer?: { id: string; email: string };
}

interface ProfileSnapshot {
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  resumeSignedUrl?: string;
  location?: string;
}

// ─── Application Form Data ────────────────────────────
interface ApplicationForm {
  // Personal
  fullName: string;
  email: string;
  phone: string;
  location: string;
  // Professional
  education: string;
  experience: string;
  skills: string;
  // Links
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  // Expectations
  expectedSalary: string;
  noticePeriod: string;
  availableFrom: string;
  // Cover
  coverLetter: string;
}

const EMPTY_FORM: ApplicationForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  education: '',
  experience: '',
  skills: '',
  linkedinUrl: '',
  portfolioUrl: '',
  githubUrl: '',
  expectedSalary: '',
  noticePeriod: '',
  availableFrom: '',
  coverLetter: '',
};

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Resume', icon: FileText },
  { id: 3, label: 'Background', icon: GraduationCap },
  { id: 4, label: 'Links & Pay', icon: Link2 },
  { id: 5, label: 'Review', icon: Eye },
];

export default function ApplyModal({
  job,
  isOpen,
  onClose,
  onSuccess,
}: {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ApplicationForm>({ ...EMPTY_FORM });
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [useProfileResume, setUseProfileResume] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch profile + pre-fill on open
  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(1);
    setForm({ ...EMPTY_FORM });
    setUploadedFile(null);
    setUseProfileResume(false);
    setError('');
    setFieldErrors({});
    setSubmitted(false);
    setProfileLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
      const returnUrl = encodeURIComponent(`/jobs?jobId=${job.id}`);
      router.push(`/auth/signin?returnUrl=${returnUrl}`);
      onClose();
      return;
    }

    // Load profile for pre-fill
    apiAuth
      .withToken(token)
      .get('/user/seeker/profile')
      .then((res) => {
        const p = res.data;
        setProfile(p);

        // Pre-fill from profile
        setForm((prev) => ({
          ...prev,
          fullName:
            p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : prev.fullName,
          skills: (p.skills || []).join(', '),
          location: p.location || prev.location,
        }));

        // Also fetch user email
        return apiAuth.withToken(token).get('/user/me');
      })
      .then((res) => {
        const userData = res.data?.data || res.data;
        setForm((prev) => ({
          ...prev,
          email: userData?.email || prev.email,
        }));
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => setProfileLoading(false));
  }, [isOpen, job.id, router, onClose]);

  if (!isOpen) return null;

  const hasProfileResume = !!profile?.resumeUrl;

  // ─── Field Update Helper ───────────────────────────
  const updateField = (field: keyof ApplicationForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ─── Validation ────────────────────────────────────
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!form.fullName.trim()) errors.fullName = 'Full name is required';
      if (!form.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = 'Enter a valid email address';
    }

    if (step === 2) {
      if (!useProfileResume && !uploadedFile) {
        errors.resume = 'Please upload a resume or use your profile CV';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    setFieldErrors({});
  };

  // ─── File Handling ─────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFieldErrors({ resume: 'Only PDF files are accepted.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors({ resume: 'File must not exceed 5MB.' });
      return;
    }

    setUploadedFile(file);
    setUseProfileResume(false);
    setFieldErrors({});
  };

  // ─── Submit ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/signin');
      onClose();
      return;
    }

    try {
      // Step A: Upload fresh resume if needed
      if (!useProfileResume && uploadedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/user/seeker/resume`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Resume upload failed');
        }
        setUploading(false);
      }

      // Step B: Submit the full application
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        location: form.location.trim() || undefined,
        education: form.education.trim() || undefined,
        experience: form.experience.trim() || undefined,
        skills: form.skills
          ? form.skills
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
          : undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        expectedSalary: form.expectedSalary.trim() || undefined,
        noticePeriod: form.noticePeriod.trim() || undefined,
        availableFrom: form.availableFrom.trim() || undefined,
        coverLetter: form.coverLetter.trim() || undefined,
      };

      await apiAuth.withToken(token).post(`/jobs/${job.id}/apply`, payload);
      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Application failed';

      if (typeof message === 'string' && message.toLowerCase().includes('already applied')) {
        setSubmitted(true);
        return;
      }

      setError(typeof message === 'string' ? message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // ─── Input component helpers ───────────────────────
  const inputClass =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white';
  const errorInputClass =
    'w-full rounded-xl border border-red-300 px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition bg-red-50/50';
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="text-xs text-red-600 mt-1">{fieldErrors[field]}</p>
    ) : null;

  // ─── Step Renderer ─────────────────────────────────

  const renderStep = () => {
    // 🔄 Loading
    if (profileLoading) {
      return (
        <div className="p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-sm text-gray-500">Preparing your application...</p>
        </div>
      );
    }

    // ✅ Submitted
    if (submitted) {
      return (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-green-100 p-4 rounded-full mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Your application for <strong>{job.title}</strong> has been sent. Track it on your
            dashboard.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                router.push('/seeker/applications');
                onClose();
              }}
              className="flex-1 bg-teal-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-teal-700 transition text-sm"
            >
              View Applications
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-200 transition text-sm"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      );
    }

    // ⏳ Submitting
    if (submitting) {
      return (
        <div className="p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
          <p className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading your resume...' : 'Submitting application...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
        </div>
      );
    }

    // ─── Step 1: Personal Info ──────────────────────
    if (currentStep === 1) {
      return (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
          </div>
          <p className="text-sm text-gray-500 -mt-3">
            Basic contact details for the employer to reach you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className={`${fieldErrors.fullName ? errorInputClass : inputClass} pl-10`}
                  placeholder="John Doe"
                />
              </div>
              <FieldError field="fullName" />
            </div>

            <div>
              <label className={labelClass}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`${fieldErrors.email ? errorInputClass : inputClass} pl-10`}
                  placeholder="you@example.com"
                />
              </div>
              <FieldError field="email" />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Location / City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="Lagos, Nigeria"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ─── Step 2: Resume ─────────────────────────────
    if (currentStep === 2) {
      return (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-900">Resume / CV</h3>
          </div>
          <p className="text-sm text-gray-500 -mt-3">
            Attach your latest resume. PDF only, 5MB max.
          </p>

          {/* Option A: Use Profile */}
          {hasProfileResume && (
            <button
              onClick={() => {
                setUseProfileResume(true);
                setUploadedFile(null);
                setFieldErrors({});
              }}
              className={`w-full text-left p-4 rounded-xl border-2 transition ${
                useProfileResume
                  ? 'border-teal-500 bg-teal-50 shadow-sm'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${useProfileResume ? 'bg-teal-100' : 'bg-gray-100'}`}
                >
                  <User className={`w-5 h-5 ${useProfileResume ? 'text-teal-700' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Use profile resume</p>
                  <p className="text-xs text-gray-500">
                    Resume already on file from your profile
                  </p>
                </div>
                {useProfileResume && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
              </div>
            </button>
          )}

          {/* Separator */}
          {hasProfileResume && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400 font-medium">
                  OR
                </span>
              </div>
            </div>
          )}

          {/* Option B: Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              uploadedFile
                ? 'border-teal-300 bg-teal-50'
                : fieldErrors.resume
                ? 'border-red-300 bg-red-50/30'
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/20'
            }`}
          >
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-4">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-teal-700" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-teal-600 ml-auto" />
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {hasProfileResume ? 'Upload a different resume' : 'Upload your resume'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click to browse · PDF only · 5MB max
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <FieldError field="resume" />

          <div className="flex items-start gap-2 text-xs text-gray-400 pt-1">
            <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Your resume is encrypted in transit and stored securely. Only the hiring team
              for this position can access it.
            </span>
          </div>
        </div>
      );
    }

    // ─── Step 3: Background ─────────────────────────
    if (currentStep === 3) {
      return (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-900">Professional Background</h3>
          </div>
          <p className="text-sm text-gray-500 -mt-3">
            Help the employer understand your qualifications.
          </p>

          <div>
            <label className={labelClass}>Education</label>
            <textarea
              value={form.education}
              onChange={(e) => updateField('education', e.target.value)}
              rows={3}
              maxLength={2000}
              className={inputClass + ' resize-none'}
              placeholder="BSc Computer Science — University of Lagos, 2020&#10;MSc Data Science — University of Oxford, 2022"
            />
            <p className="text-xs text-gray-400 mt-1">
              Include degree, institution, and graduation year
            </p>
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> Work Experience
              </span>
            </label>
            <textarea
              value={form.experience}
              onChange={(e) => updateField('experience', e.target.value)}
              rows={4}
              maxLength={3000}
              className={inputClass + ' resize-none'}
              placeholder="Senior Frontend Developer — Paystack (2021–Present)&#10;• Led migration from AngularJS to React, improving load times by 40%&#10;• Managed a team of 4 engineers&#10;&#10;Junior Developer — Andela (2019–2021)&#10;• Built REST APIs for mobile banking platform"
            />
            <p className="text-xs text-gray-400 mt-1">
              List your most relevant roles with key achievements
            </p>
          </div>

          <div>
            <label className={labelClass}>Key Skills</label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => updateField('skills', e.target.value)}
              className={inputClass}
              placeholder="React, TypeScript, Node.js, PostgreSQL, AWS"
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
          </div>
        </div>
      );
    }

    // ─── Step 4: Links & Expectations ────────────────
    if (currentStep === 4) {
      return (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-900">Links & Expectations</h3>
          </div>
          <p className="text-sm text-gray-500 -mt-3">
            External profiles and your availability details.
          </p>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Online Profiles
            </p>

            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0077B5]" />
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => updateField('githubUrl', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="https://github.com/johndoe"
              />
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="https://johndoe.dev"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Expectations */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Availability & Compensation
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Expected Salary
                  </span>
                </label>
                <input
                  type="text"
                  value={form.expectedSalary}
                  onChange={(e) => updateField('expectedSalary', e.target.value)}
                  className={inputClass}
                  placeholder="₦500,000/mo or Negotiable"
                />
              </div>

              <div>
                <label className={labelClass}>Notice Period</label>
                <select
                  value={form.noticePeriod}
                  onChange={(e) => updateField('noticePeriod', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  <option value="Immediately">Immediately</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Earliest Start Date
                </span>
              </label>
              <input
                type="date"
                value={form.availableFrom}
                onChange={(e) => updateField('availableFrom', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Cover Letter */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Cover Letter
                <span className="text-gray-400 font-normal">(optional)</span>
              </span>
            </label>
            <textarea
              value={form.coverLetter}
              onChange={(e) => updateField('coverLetter', e.target.value)}
              rows={5}
              maxLength={5000}
              className={inputClass + ' resize-none'}
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in this role. With my background in..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.coverLetter.length}/5,000
            </p>
          </div>
        </div>
      );
    }

    // ─── Step 5: Review ─────────────────────────────
    if (currentStep === 5) {
      const sections = [
        {
          title: 'Personal Info',
          icon: <User className="w-4 h-4" />,
          items: [
            { label: 'Name', value: form.fullName },
            { label: 'Email', value: form.email },
            { label: 'Phone', value: form.phone },
            { label: 'Location', value: form.location },
          ],
        },
        {
          title: 'Resume',
          icon: <FileText className="w-4 h-4" />,
          items: [
            {
              label: 'Source',
              value: useProfileResume
                ? '✓ Profile resume'
                : uploadedFile
                ? `↑ ${uploadedFile.name}`
                : 'Not selected',
            },
          ],
        },
        {
          title: 'Background',
          icon: <GraduationCap className="w-4 h-4" />,
          items: [
            { label: 'Education', value: form.education },
            { label: 'Experience', value: form.experience },
            { label: 'Skills', value: form.skills },
          ],
        },
        {
          title: 'Links & Expectations',
          icon: <Link2 className="w-4 h-4" />,
          items: [
            { label: 'LinkedIn', value: form.linkedinUrl },
            { label: 'GitHub', value: form.githubUrl },
            { label: 'Portfolio', value: form.portfolioUrl },
            { label: 'Expected Salary', value: form.expectedSalary },
            { label: 'Notice Period', value: form.noticePeriod },
            { label: 'Available From', value: form.availableFrom },
          ],
        },
      ];

      return (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-900">Review Application</h3>
          </div>
          <p className="text-sm text-gray-500 -mt-2">
            Please review your details before submitting.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {sections.map((section) => (
              <div
                key={section.title}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
                  {section.icon} {section.title}
                </h4>
                <div className="space-y-1.5">
                  {section.items
                    .filter((item) => item.value)
                    .map((item) => (
                      <div key={item.label} className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 w-24 shrink-0 pt-0.5">
                          {item.label}
                        </span>
                        <span className="text-sm text-gray-900 whitespace-pre-line break-words line-clamp-2">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  {section.items.filter((item) => item.value).length === 0 && (
                    <p className="text-xs text-gray-400 italic">Not provided</p>
                  )}
                </div>
              </div>
            ))}

            {form.coverLetter && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Cover Letter
                </h4>
                <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-4">
                  {form.coverLetter}
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold py-3.5 px-6 rounded-xl hover:from-teal-700 hover:to-teal-800 transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-base"
          >
            <CheckCircle2 className="w-5 h-5" />
            Submit Application
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              By submitting, you agree to share this information with the hiring team.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  // ─── Stepper UI ────────────────────────────────────
  const showStepper = !profileLoading && !submitted && !submitting;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Mobile: full-screen sheet | Desktop: centered card */}
      <div className="h-full sm:h-auto sm:max-h-[85vh] bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-xl overflow-hidden flex flex-col sm:absolute sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-gray-100 transition z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-gray-100 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 pr-10">Apply for this role</h2>
          <p className="text-xs sm:text-sm text-gray-500 truncate">{job.title}</p>
        </div>

        {/* Step Indicator */}
        {showStepper && (
          <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-gray-50 bg-gray-50/50 shrink-0">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const isActive = s.id === currentStep;
                const isDone = s.id < currentStep;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-teal-600 text-white'
                            : isActive
                            ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500 ring-offset-1'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <s.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </div>
                      <span
                        className={`text-[8px] sm:text-[10px] font-medium hidden xs:block ${
                          isActive ? 'text-teal-700' : isDone ? 'text-teal-600' : 'text-gray-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-0.5 sm:mx-1 rounded-full transition-colors ${
                          s.id < currentStep ? 'bg-teal-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">{renderStep()}</div>

        {/* Footer Navigation (only for steps 1-4) */}
        {showStepper && currentStep < 5 && (
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white safe-bottom">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="text-xs text-gray-400">
              {currentStep} / {STEPS.length}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 py-2.5 px-4 sm:px-5 rounded-xl transition shadow-sm"
            >
              {currentStep === 4 ? 'Review' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
