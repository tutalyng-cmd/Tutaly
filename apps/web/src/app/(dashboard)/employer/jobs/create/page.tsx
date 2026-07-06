'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import locationsData from '@/data/locations.json';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
  department: string;
  description: string;
  requirements: string;
  jobType: string;
  workMode: string;
  
  currency: string;
  minSalary: string;
  maxSalary: string;
  showSalary: boolean;
  
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
  title: '', department: '', description: '', requirements: '', jobType: 'Full-time', workMode: 'On-site',
  currency: 'NGN', minSalary: '', maxSalary: '', showSalary: true,
  country: 'Nigeria', state: '', area: '', experienceLevel: 'Mid level',
  industry: '', qualification: '', skills: [],
  deadline: '', applyMethod: 'platform', externalUrl: '', isFeatured: false, isUrgent: false
};

export default function PostJobWizard() {
  const router = useRouter();
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

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      updateForm({ skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateForm({ skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!formData.title || !formData.description) return setErrorMsg('Title and Description are required.');
    if (!formData.country || !formData.industry) return setErrorMsg('Country and Industry are required.');
    
    setSubmitting(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const payload: any = {
        title: formData.title,
        description: formData.description + (formData.requirements ? `\n\nRequirements:\n${formData.requirements}` : ''),
        jobType: formData.jobType.toLowerCase().replace(' ', '-'),
        workMode: formData.workMode.toLowerCase().replace('-', ''),
        currency: formData.currency,
        country: formData.country,
        state: formData.state || undefined,
        area: formData.area || undefined,
        experienceLevel: formData.experienceLevel.toLowerCase().split(' ')[0],
        industry: formData.industry,
        role: formData.title, // using title for role as placeholder
        skills: formData.skills,
        isFeatured: formData.isFeatured,
      };

      if (formData.minSalary) payload.minSalary = Number(formData.minSalary);
      if (formData.maxSalary) payload.maxSalary = Number(formData.maxSalary);
      if (formData.deadline) payload.deadline = formData.deadline;

      const res = await apiAuth.withToken(token).post('/jobs', payload);
      
      if (formData.isFeatured && !isDraft) {
        alert('Job posted! Since it is a featured job, you will be redirected to payment.');
      } else {
        alert(isDraft ? 'Job saved as draft!' : 'Job posted successfully! It is now pending admin review.');
      }
      router.push('/employer/jobs');
    } catch (e) {
      const err = e as any;
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to post job');
      setSubmitting(false);
    }
  };

  return (
    <div className="dcard">
      {errorMsg && (
        <div className="mb-8 rounded-xl p-4 border flex items-start" style={{ borderColor: 'var(--red)', backgroundColor: 'var(--red-10)' }}>
          <p className="text-sm" style={{ color: 'var(--red)' }}>{errorMsg}</p>
        </div>
      )}

      <div className="form-section">
        <div className="form-section__title">Job details</div>
        <div className="form-section__desc">The basics candidates will see first.</div>

        <div className="form-field">
          <label className="form-label" htmlFor="jtitle">Job title<span className="required" style={{ color: 'var(--red)', marginLeft: '4px' }}>*</span></label>
          <input className="input" type="text" id="jtitle" placeholder="e.g. Senior Product Manager" value={formData.title} onChange={e => updateForm({ title: e.target.value })} />
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label" htmlFor="jdept">Department</label>
            <input className="input" type="text" id="jdept" placeholder="e.g. Product" value={formData.department} onChange={e => updateForm({ department: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="jtype">Job type</label>
            <select className="input" id="jtype" value={formData.jobType} onChange={e => updateForm({ jobType: e.target.value })}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-field">
            <label className="form-label">Country *</label>
            <select className="input" value={formData.country} onChange={e => updateForm({ country: e.target.value, state: '', area: '' })}>
              <option value="">Select country...</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">State</label>
            <select className="input" value={formData.state} onChange={e => updateForm({ state: e.target.value, area: '' })} disabled={states.length === 0}>
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Area</label>
            <select className="input" value={formData.area} onChange={e => updateForm({ area: e.target.value })} disabled={areas.length === 0}>
              <option value="">All Areas</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label" htmlFor="jmode">Work mode</label>
            <select className="input" id="jmode" value={formData.workMode} onChange={e => updateForm({ workMode: e.target.value })}>
              <option>On-site</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="jexp">Experience level</label>
            <select className="input" id="jexp" value={formData.experienceLevel} onChange={e => updateForm({ experienceLevel: e.target.value })}>
              <option>Entry level</option>
              <option>Mid level</option>
              <option>Senior level</option>
              <option>Executive</option>
            </select>
          </div>
        </div>
        
        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Industry *</label>
            <select className="input" value={formData.industry} onChange={e => updateForm({ industry: e.target.value })}>
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Minimum Qualification</label>
            <select className="input" value={formData.qualification} onChange={e => updateForm({ qualification: e.target.value })}>
              <option value="">Select qualification...</option>
              {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section__title">Compensation</div>
        <div className="form-section__desc">Listings with visible salary get 3× more qualified applicants.</div>
        
        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label" htmlFor="jsalmin">Minimum salary (₦ / month)</label>
            <input className="input" type="number" id="jsalmin" placeholder="e.g. 700000" value={formData.minSalary} onChange={e => updateForm({ minSalary: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="jsalmax">Maximum salary (₦ / month)</label>
            <input className="input" type="number" id="jsalmax" placeholder="e.g. 1000000" value={formData.maxSalary} onChange={e => updateForm({ maxSalary: e.target.value })} />
          </div>
        </div>
        <label className="check-row" style={{ marginBottom: 0 }}>
          <span className={cn("filter-checkbox", formData.showSalary ? "checked" : "")} onClick={(e) => { e.preventDefault(); updateForm({ showSalary: !formData.showSalary }); }} style={{ marginTop: '2px' }}></span>
          <span>Show salary range publicly on this listing</span>
        </label>
      </div>

      <div className="form-section">
        <div className="form-section__title">Job description</div>
        <div className="form-section__desc">Describe the role, responsibilities, and what success looks like.</div>
        <div className="form-field">
          <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--c-600)' }}>
            <ReactQuill 
              theme="snow" 
              value={formData.description} 
              onChange={val => updateForm({ description: val })}
              className="h-64 border-0"
            />
          </div>
        </div>
        <div className="form-field mt-14" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="jreq">Requirements (Optional)</label>
          <textarea className="textarea" id="jreq" style={{ minHeight: '100px' }} placeholder="List key requirements, one per line..." value={formData.requirements} onChange={e => updateForm({ requirements: e.target.value })}></textarea>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section__title">Skills & Screening</div>
        <div className="form-section__desc">Required skills candidates should have.</div>
        
        {formData.skills.map(skill => (
          <div key={skill} className="file-chip border rounded-lg p-3 flex items-center justify-between mb-2" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--c-600)' }}>
            <span className="file-chip__name text-sm" style={{ color: 'var(--c-200)' }}>{skill}</span>
            <span className="file-chip__remove cursor-pointer transition-colors hover:opacity-70" aria-label="Remove skill" style={{ color: 'var(--c-400)' }} onClick={() => removeSkill(skill)}>
              <X width={14} height={14} strokeWidth={2} />
            </span>
          </div>
        ))}
        
        <div className="flex gap-2 mt-4">
          <input className="input" type="text" placeholder="Type a skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
          <button type="button" className="btn btn--ghost btn--sm whitespace-nowrap" onClick={addSkill}>+ Add skill</button>
        </div>
      </div>
      
      <div className="form-section">
        <div className="form-section__title">Application Settings & Visibility</div>
        <div className="form-section__desc">Configure how candidates apply and boost your listing.</div>
        
        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Application Deadline</label>
            <input className="input" type="date" value={formData.deadline} onChange={e => updateForm({ deadline: e.target.value })} />
            <p className="mt-2 text-xs" style={{ color: 'var(--c-500)' }}>Leave blank for open-ended hiring.</p>
          </div>
          <div className="form-field">
            <label className="form-label">How should candidates apply?</label>
            <div className="flex p-1 rounded-lg w-full border" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--c-700)' }}>
              <button type="button" onClick={() => updateForm({ applyMethod: 'platform' })} className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", formData.applyMethod === 'platform' ? "shadow-sm" : "opacity-60")} style={formData.applyMethod === 'platform' ? { backgroundColor: 'var(--c-700)', color: 'var(--c-100)' } : { color: 'var(--c-400)' }}>
                On Platform
              </button>
              <button type="button" onClick={() => updateForm({ applyMethod: 'external' })} className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", formData.applyMethod === 'external' ? "shadow-sm" : "opacity-60")} style={formData.applyMethod === 'external' ? { backgroundColor: 'var(--c-700)', color: 'var(--c-100)' } : { color: 'var(--c-400)' }}>
                External URL
              </button>
            </div>
            {formData.applyMethod === 'external' && (
              <div className="mt-4">
                <input type="url" placeholder="https://your-company.com/careers" value={formData.externalUrl} onChange={e => updateForm({ externalUrl: e.target.value })} className="input" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <label className={cn("flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all")} style={formData.isFeatured ? { borderColor: 'var(--gold)', backgroundColor: 'var(--gold-10)' } : { borderColor: 'var(--c-700)', backgroundColor: 'var(--c-800)' }}>
            <div className="flex items-center h-6 pt-1">
               <div className={cn("filter-checkbox", formData.isFeatured ? "checked" : "")} style={formData.isFeatured ? { borderColor: 'var(--gold)', backgroundColor: 'var(--gold)' } : { borderColor: 'var(--c-500)' }} onClick={(e) => { e.preventDefault(); updateForm({ isFeatured: !formData.isFeatured }); }}></div>
            </div>
            <div className="ml-4 flex-1" onClick={(e) => { e.preventDefault(); updateForm({ isFeatured: !formData.isFeatured }); }}>
              <span className="block text-base font-bold" style={{ color: 'var(--c-100)' }}>Featured Job Listing</span>
              <span className="block text-sm mt-1" style={{ color: 'var(--c-400)' }}>Pin your job to the top of search results and highlight it across the platform. Attracts 3x more views. <strong className="font-bold ml-1" style={{ color: 'var(--gold)' }}>₦10,000 / week</strong></span>
            </div>
          </label>
          
          <label className={cn("flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all")} style={formData.isUrgent ? { borderColor: 'var(--red)', backgroundColor: 'var(--red-10)' } : { borderColor: 'var(--c-700)', backgroundColor: 'var(--c-800)' }}>
            <div className="flex items-center h-6 pt-1">
              <div className={cn("filter-checkbox", formData.isUrgent ? "checked" : "")} style={formData.isUrgent ? { borderColor: 'var(--red)', backgroundColor: 'var(--red)' } : { borderColor: 'var(--c-500)' }} onClick={(e) => { e.preventDefault(); updateForm({ isUrgent: !formData.isUrgent }); }}></div>
            </div>
            <div className="ml-4 flex-1" onClick={(e) => { e.preventDefault(); updateForm({ isUrgent: !formData.isUrgent }); }}>
              <span className="block text-base font-bold" style={{ color: 'var(--c-100)' }}>Mark as Urgent</span>
              <span className="block text-sm mt-1" style={{ color: 'var(--c-400)' }}>Adds an "Urgent Hiring" badge to your listing to alert candidates of immediate start dates.</span>
            </div>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button type="button" className="btn btn--ghost" onClick={() => handleSubmit(true)} disabled={submitting}>Save as draft</button>
        <button type="button" className="btn btn--primary" onClick={() => handleSubmit(false)} disabled={submitting}>{submitting ? 'Publishing...' : 'Publish job post'}</button>
      </div>

    </div>
  );
}
