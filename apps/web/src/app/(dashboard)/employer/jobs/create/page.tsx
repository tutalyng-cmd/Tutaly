'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import locationsData from '@/data/locations.json';

const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Oil & Gas',
  'Telecommunications',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Agriculture',
  'Consulting',
  'Media & Entertainment',
  'Retail & E-Commerce',
  'Logistics & Transportation',
  'Legal',
  'NGO & Non-Profit',
];

export default function PostJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Cascading location state
  const locations: Record<string, Record<string, string[]>> = locationsData;
  const [selectedCountry, setSelectedCountry] = useState('Nigeria');
  const [selectedState, setSelectedState] = useState('');

  const countries = useMemo(() => Object.keys(locations), [locations]);
  const states = useMemo(() => {
    if (selectedCountry && locations[selectedCountry]) return Object.keys(locations[selectedCountry]);
    return [];
  }, [selectedCountry, locations]);
  const areas = useMemo(() => {
    if (selectedCountry && selectedState && locations[selectedCountry]?.[selectedState])
      return locations[selectedCountry][selectedState];
    return [];
  }, [selectedCountry, selectedState, locations]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedState('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(formData.entries());

    // Parse numbers
    if (data.minSalary) data.minSalary = Number(data.minSalary);
    else delete data.minSalary;
    if (data.maxSalary) data.maxSalary = Number(data.maxSalary);
    else delete data.maxSalary;

    // Remove empty optional fields
    if (!data.area) delete data.area;
    if (!data.deadline) delete data.deadline;
    if (!data.location) delete data.location;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      await apiAuth.withToken(token).post('/jobs', data);
      alert('Job posted successfully! It is now pending admin review.');
      router.push('/employer/jobs');
    } catch (err: unknown) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      alert(error.response?.data?.message || error.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 px-3';
  const selectClass = inputClass;
  const labelClass = 'block text-sm font-medium leading-6 text-gray-900';

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
      <p className="text-gray-500 mb-8">Fill in the details below. Your job will be reviewed before going live.</p>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8 space-y-8">

          {/* Section: Basic Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-4">Basic Information</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className={labelClass}>Job Title *</label>
                <div className="mt-2">
                  <input type="text" name="title" id="title" required className={inputClass} placeholder="e.g. Senior Backend Engineer" />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="description" className={labelClass}>Job Description *</label>
                <div className="mt-2">
                  <textarea id="description" name="description" rows={5} required className={inputClass} placeholder="Describe the role, responsibilities, and requirements..." />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="industry" className={labelClass}>Industry *</label>
                <div className="mt-2">
                  <select name="industry" id="industry" required className={selectClass}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="role" className={labelClass}>Role *</label>
                <div className="mt-2">
                  <input type="text" name="role" id="role" required className={inputClass} placeholder="e.g. Software Engineer" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section: Location */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-4">Location</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="country" className={labelClass}>Country *</label>
                <div className="mt-2">
                  <select id="country" name="country" value={selectedCountry} onChange={handleCountryChange} required className={selectClass}>
                    <option value="">Select country...</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="state" className={labelClass}>State</label>
                <div className="mt-2">
                  <select id="state" name="state" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={selectClass} disabled={states.length === 0}>
                    <option value="">Select state...</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="area" className={labelClass}>Area / LGA</label>
                <div className="mt-2">
                  <select id="area" name="area" className={selectClass} disabled={areas.length === 0}>
                    <option value="">Select area...</option>
                    {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section: Job Details */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-4">Job Details</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="jobType" className={labelClass}>Job Type *</label>
                <div className="mt-2">
                  <select name="jobType" id="jobType" required className={selectClass}>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="experienceLevel" className={labelClass}>Experience *</label>
                <div className="mt-2">
                  <select name="experienceLevel" id="experienceLevel" required className={selectClass}>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead / Manager</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="workMode" className={labelClass}>Work Mode *</label>
                <div className="mt-2">
                  <select name="workMode" id="workMode" required className={selectClass}>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="deadline" className={labelClass}>Application Deadline</label>
                <div className="mt-2">
                  <input type="date" name="deadline" id="deadline" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section: Compensation */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-4">Compensation</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="currency" className={labelClass}>Currency</label>
                <div className="mt-2">
                  <select name="currency" id="currency" className={selectClass}>
                    <option value="NGN">₦ NGN (Naira)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (Pound)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="minSalary" className={labelClass}>Min Salary</label>
                <div className="mt-2">
                  <input type="number" name="minSalary" id="minSalary" className={inputClass} placeholder="e.g. 300000" min="0" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="maxSalary" className={labelClass}>Max Salary</label>
                <div className="mt-2">
                  <input type="number" name="maxSalary" id="maxSalary" className={inputClass} placeholder="e.g. 600000" min="0" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50 rounded-b-xl">
          <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-gray-900">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-teal-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
