'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import locationsData from '@/data/locations.json';
import { CheckCircle2, ChevronRight, Briefcase, MapPin, Settings, AlertCircle, Plus, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Oil & Gas',
  'Telecommunications', 'Education', 'Manufacturing', 'Real Estate',
  'Agriculture', 'Consulting', 'Media & Entertainment', 'Retail & E-Commerce',
  'Logistics & Transportation', 'Legal', 'NGO & Non-Profit',
];

const QUALIFICATIONS = [
  'High School', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Any'
];

type FormData = {
  title: string;
  description: string;
  jobType: string;
  workMode: string;
  salaryMode: 'fixed' | 'range' | 'negotiable';
  currency: string;
  minSalary: string;
  maxSalary: string;
  salaryPeriod: string;
  
  country: string;
  state: string;
  area: string;
  experienceLevel: string;
  industry: string;
  qualification: string;
  skills: string[];
  
  deadline: string;
  applyMethod: 'platform' | 'external';
  externalUrl: string;
  isFeatured: boolean;
  isUrgent: boolean;
};

const DEFAULT_FORM_DATA: FormData = {
  title: '', description: '', jobType: 'full-time', workMode: 'onsite',
  salaryMode: 'range', currency: 'NGN', minSalary: '', maxSalary: '', salaryPeriod: 'monthly',
  
  country: 'Nigeria', state: '', area: '', experienceLevel: 'mid',
  industry: '', qualification: '', skills: [],
  
  deadline: '', applyMethod: 'platform', externalUrl: '', isFeatured: false, isUrgent: false
};

const STEPS = [
  { id: 'step1', name: 'Job Details', icon: Briefcase },
  { id: 'step2', name: 'Location & Requirements', icon: MapPin },
  { id: 'step3', name: 'Application Settings', icon: Settings },
];

export default function PostJobWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Location logic
  const locations: Record<string, Record<string, string[]>> = locationsData;
  const countries = useMemo(() => Object.keys(locations), [locations]);
  const states = useMemo(() => {
    if (formData.country && locations[formData.country]) return Object.keys(locations[formData.country]);
    return [];
  }, [formData.country, locations]);
  const areas = useMemo(() => {
    if (formData.country && formData.state && locations[formData.country]?.[formData.state])
      return locations[formData.country][formData.state];
    return [];
  }, [formData.country, formData.state, locations]);

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.title || !formData.description) return setErrorMsg('Title and Description are required.');
    }
    if (currentStep === 1) {
      if (!formData.country || !formData.industry) return setErrorMsg('Country and Industry are required.');
    }
    setErrorMsg('');
    setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1));
  };

  const handlePrev = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      updateForm({ skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateForm({ skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const payload: any = {
        title: formData.title,
        description: formData.description,
        jobType: formData.jobType,
        workMode: formData.workMode,
        currency: formData.currency,
        country: formData.country,
        state: formData.state || undefined,
        area: formData.area || undefined,
        experienceLevel: formData.experienceLevel,
        industry: formData.industry,
        role: formData.title, // using title for role as placeholder
        skills: formData.skills,
        isFeatured: formData.isFeatured,
      };

      if (formData.salaryMode !== 'negotiable') {
        if (formData.minSalary) payload.minSalary = Number(formData.minSalary);
        if (formData.maxSalary && formData.salaryMode === 'range') payload.maxSalary = Number(formData.maxSalary);
      }
      if (formData.deadline) payload.deadline = formData.deadline;

      // Submit standard Job
      const res = await apiAuth.withToken(token).post('/jobs', payload);
      
      // If featured, they might need to pay
      if (formData.isFeatured) {
        // Trigger payment logic here (could redirect to checkout)
        alert('Job posted! Since it is a featured job, you will be redirected to payment.');
      } else {
        alert('Job posted successfully! It is now pending admin review.');
      }
      router.push('/employer/jobs');
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to post job');
      setSubmitting(false);
    }
  };

  const inputClass = "block w-full rounded-xl border-0 py-3 text-c900 shadow-sm ring-1 ring-inset ring-c300 placeholder:text-c400 focus:ring-2 focus:ring-inset focus:ring-c900 sm:text-sm sm:leading-6 px-4 bg-white transition-all";
  const labelClass = "block text-sm font-semibold leading-6 text-c900 mb-2";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-c900 tracking-tight">Post a Job</h1>
        <p className="mt-2 text-c500">Find the perfect candidate by providing detailed information about the role.</p>
      </div>

      {/* Progress Steps */}
      <nav aria-label="Progress" className="mb-12">
        <ol role="list" className="flex items-center">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;

            return (
              <li key={step.name} className={cn("relative flex-1", index !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : '')}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className={cn("h-1 w-full rounded-full transition-colors", isCompleted ? "bg-green" : "bg-c200")} />
                </div>
                <button
                  type="button"
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ring-4 ring-white",
                    isCompleted ? "bg-green hover:bg-green" : isCurrent ? "bg-c900 border-2 border-c900" : "bg-white border-2 border-c300"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-white" aria-hidden="true" />
                  ) : (
                    <StepIcon className={cn("h-5 w-5", isCurrent ? "text-white" : "text-c400")} aria-hidden="true" />
                  )}
                  <span className="sr-only">{step.name}</span>
                </button>
                <span className={cn(
                  "absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap",
                  isCurrent ? "text-c900" : isCompleted ? "text-green" : "text-c500"
                )}>
                  {step.name}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {errorMsg && (
        <div className="mb-8 rounded-xl bg-red p-4 border border-red flex items-start">
          <AlertCircle className="h-5 w-5 text-red mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red">{errorMsg}</p>
        </div>
      )}

      {/* Form Area */}
      <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-c100 overflow-hidden">
        <div className="p-8 sm:p-12">
          
          {/* STEP 1: Job Details */}
          {currentStep === 0 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <label htmlFor="title" className={labelClass}>Job Title *</label>
                <input
                  type="text" id="title"
                  value={formData.title} onChange={e => updateForm({ title: e.target.value })}
                  className={cn(inputClass, "text-2xl font-bold py-4")}
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>

              <div>
                <label className={labelClass}>Job Description *</label>
                <div className="bg-white rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-c900">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.description} 
                    onChange={(val) => updateForm({ description: val })}
                    className="h-64 mb-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Employment Type</label>
                  <div className="flex flex-wrap gap-3">
                    {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                      <button
                        key={type} type="button"
                        onClick={() => updateForm({ jobType: type })}
                        className={cn(
                          "px-4 py-2.5 rounded-full text-sm font-medium transition-colors border",
                          formData.jobType === type ? "bg-c900 text-white border-c900" : "bg-white text-c700 border-c200 hover:border-c300"
                        )}
                      >
                        {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Work Mode</label>
                  <div className="flex flex-wrap gap-3">
                    {['onsite', 'hybrid', 'remote'].map((mode) => (
                      <button
                        key={mode} type="button"
                        onClick={() => updateForm({ workMode: mode })}
                        className={cn(
                          "px-4 py-2.5 rounded-full text-sm font-medium transition-colors border",
                          formData.workMode === mode ? "bg-green text-white border-green" : "bg-white text-c700 border-c200 hover:border-c300"
                        )}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-c100 rounded-2xl p-6 border border-c100">
                <label className={labelClass}>Compensation</label>
                <div className="flex gap-4 mb-6">
                  {['range', 'fixed', 'negotiable'].map(mode => (
                    <label key={mode} className="flex items-center">
                      <input type="radio" name="salaryMode" checked={formData.salaryMode === mode} onChange={() => updateForm({ salaryMode: mode as any })} className="h-4 w-4 text-green focus:ring-green" />
                      <span className="ml-2 text-sm text-c700 capitalize">{mode}</span>
                    </label>
                  ))}
                </div>

                {formData.salaryMode !== 'negotiable' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div>
                      <select value={formData.currency} onChange={e => updateForm({ currency: e.target.value })} className={inputClass}>
                        <option value="NGN">₦ NGN</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                    <div className={formData.salaryMode === 'fixed' ? 'sm:col-span-2' : ''}>
                      <input type="number" placeholder={formData.salaryMode === 'fixed' ? "Amount" : "Min"} value={formData.minSalary} onChange={e => updateForm({ minSalary: e.target.value })} className={inputClass} />
                    </div>
                    {formData.salaryMode === 'range' && (
                      <div>
                        <input type="number" placeholder="Max" value={formData.maxSalary} onChange={e => updateForm({ maxSalary: e.target.value })} className={inputClass} />
                      </div>
                    )}
                    <div>
                      <select value={formData.salaryPeriod} onChange={e => updateForm({ salaryPeriod: e.target.value })} className={inputClass}>
                        <option value="monthly">/ Month</option>
                        <option value="yearly">/ Year</option>
                        <option value="hourly">/ Hour</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Location & Requirements */}
          {currentStep === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <p className="text-lg font-bold text-c900 mb-6">Where is this role located?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Country *</label>
                    <select value={formData.country} onChange={e => updateForm({ country: e.target.value, state: '', area: '' })} className={inputClass}>
                      <option value="">Select country...</option>
                      {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <select value={formData.state} onChange={e => updateForm({ state: e.target.value, area: '' })} className={inputClass} disabled={states.length === 0}>
                      <option value="">All States</option>
                      {states.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Area</label>
                    <select value={formData.area} onChange={e => updateForm({ area: e.target.value })} className={inputClass} disabled={areas.length === 0}>
                      <option value="">All Areas</option>
                      {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-c200" />

              <div>
                <p className="text-lg font-bold text-c900 mb-6">Candidate Requirements</p>
                <div className="space-y-8">
                  <div>
                    <label className={labelClass}>Experience Level</label>
                    <div className="flex flex-wrap gap-3">
                      {['entry', 'mid', 'senior', 'lead', 'executive'].map((level) => (
                        <button
                          key={level} type="button"
                          onClick={() => updateForm({ experienceLevel: level })}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                            formData.experienceLevel === level ? "bg-blue text-white border-blue shadow-md shadow-blue-500/20" : "bg-white text-c700 border-c200 hover:border-c300"
                          )}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Industry *</label>
                      <select value={formData.industry} onChange={e => updateForm({ industry: e.target.value })} className={inputClass}>
                        <option value="">Select industry...</option>
                        {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Minimum Qualification</label>
                      <select value={formData.qualification} onChange={e => updateForm({ qualification: e.target.value })} className={inputClass}>
                        <option value="">Select qualification...</option>
                        {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Required Skills</label>
                    <div className="bg-c100 p-2 rounded-xl border border-c200 flex flex-wrap items-center gap-2 focus-within:border-green focus-within:ring-1 focus-within:ring-green">
                      {formData.skills.map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1 bg-white border border-c200 px-3 py-1.5 rounded-lg text-sm font-medium text-c700 shadow-sm">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="text-c400 hover:text-red"><X className="w-3.5 h-3.5" /></button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                        }}
                        placeholder="Type a skill and press Enter..."
                        className="flex-1 bg-transparent border-0 focus:ring-0 min-w-layout-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Application Settings */}
          {currentStep === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Application Deadline</label>
                  <input type="date" value={formData.deadline} onChange={e => updateForm({ deadline: e.target.value })} className={inputClass} />
                  <p className="mt-2 text-xs text-c500">Leave blank for open-ended hiring.</p>
                </div>
                
                <div>
                  <label className={labelClass}>How should candidates apply?</label>
                  <div className="flex bg-c100 p-1 rounded-xl w-full">
                    <button type="button" onClick={() => updateForm({ applyMethod: 'platform' })} className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", formData.applyMethod === 'platform' ? "bg-white shadow-sm text-c900" : "text-c500")}>
                      On Platform
                    </button>
                    <button type="button" onClick={() => updateForm({ applyMethod: 'external' })} className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", formData.applyMethod === 'external' ? "bg-white shadow-sm text-c900" : "text-c500")}>
                      External URL
                    </button>
                  </div>
                  {formData.applyMethod === 'external' && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <input type="url" placeholder="https://your-company.com/careers" value={formData.externalUrl} onChange={e => updateForm({ externalUrl: e.target.value })} className={inputClass} />
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-c200" />

              <div>
                <p className="text-lg font-bold text-c900 mb-6">Boost Your Visibility</p>
                <div className="space-y-4">
                  <label className={cn(
                    "flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all",
                    formData.isFeatured ? "border-gold bg-gold" : "border-c200 bg-white hover:border-c300"
                  )}>
                    <div className="flex items-center h-6">
                      <input type="checkbox" checked={formData.isFeatured} onChange={e => updateForm({ isFeatured: e.target.checked })} className="h-5 w-5 text-gold rounded border-c300 focus:ring-gold" />
                    </div>
                    <div className="ml-4">
                      <span className="block text-base font-bold text-c900">Featured Job Listing</span>
                      <span className="block text-sm text-c500 mt-1">Pin your job to the top of search results and highlight it across the platform. Attracts 3x more views. <strong className="text-gold font-bold ml-1">₦10,000 / week</strong></span>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all",
                    formData.isUrgent ? "border-red bg-red" : "border-c200 bg-white hover:border-c300"
                  )}>
                    <div className="flex items-center h-6">
                      <input type="checkbox" checked={formData.isUrgent} onChange={e => updateForm({ isUrgent: e.target.checked })} className="h-5 w-5 text-red rounded border-c300 focus:ring-red" />
                    </div>
                    <div className="ml-4">
                      <span className="block text-base font-bold text-c900">Mark as Urgent</span>
                      <span className="block text-sm text-c500 mt-1">Adds an "Urgent Hiring" badge to your listing to alert candidates of immediate start dates.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Navigation */}
        <div className="bg-c100 border-t border-c100 p-6 sm:px-12 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-c500 hover:text-c900 font-semibold text-sm px-4 py-2 disabled:opacity-0 transition-opacity"
          >
            Back
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-c900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center"
            >
              Next Step <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                "px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center",
                formData.isFeatured ? "bg-gold text-white shadow-amber-500/20 hover:bg-gold" : "bg-green text-white shadow-sm hover:bg-green",
                submitting ? "opacity-70 cursor-not-allowed" : ""
              )}
            >
              {submitting ? 'Processing...' : formData.isFeatured ? 'Proceed to Payment' : 'Post Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
