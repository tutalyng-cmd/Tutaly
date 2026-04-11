'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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

export default function JobFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [country, setCountry] = useState(searchParams.get('country') || 'Nigeria');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [maxSalary, setMaxSalary] = useState(searchParams.get('maxSalary') || '');
  const [datePosted, setDatePosted] = useState(searchParams.get('datePosted') || '');

  // Cascading location data
  const locations: Record<string, Record<string, string[]>> = locationsData;
  const countries = useMemo(() => Object.keys(locations), [locations]);
  const states = useMemo(() => {
    if (country && locations[country]) return Object.keys(locations[country]);
    return [];
  }, [country, locations]);
  const areas = useMemo(() => {
    if (country && state && locations[country]?.[state]) return locations[country][state];
    return [];
  }, [country, state, locations]);

  // Reset child dropdowns when parent changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    setState('');
    setArea('');
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
    setArea('');
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (country) params.set('country', country);
    if (state) params.set('state', state);
    if (area) params.set('area', area);
    if (workMode) params.set('workMode', workMode);
    if (jobType) params.set('jobType', jobType);
    if (experienceLevel) params.set('experienceLevel', experienceLevel);
    if (industry) params.set('industry', industry);
    if (minSalary) params.set('minSalary', minSalary);
    if (maxSalary) params.set('maxSalary', maxSalary);
    if (datePosted) params.set('datePosted', datePosted);

    router.push(`/jobs?${params.toString()}`);
  };

  const handleClear = () => {
    setKeyword('');
    setCountry('Nigeria');
    setState('');
    setArea('');
    setWorkMode('');
    setJobType('');
    setExperienceLevel('');
    setIndustry('');
    setMinSalary('');
    setMaxSalary('');
    setDatePosted('');
    router.push('/jobs');
  };

  const selectClass = "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition";
  const inputClass = selectClass;
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1";

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" /> Filters
          </h2>
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        </div>

        <div className="space-y-5">
          {/* 1. Keyword / Title */}
          <div>
            <label className={labelClass}>Keyword / Title</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="e.g. Frontend Developer"
              />
            </div>
          </div>

          {/* Divider: Location */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600 mb-3">Location</p>

            {/* 2. Country */}
            <div className="mb-3">
              <label className={labelClass}>Country</label>
              <select value={country} onChange={handleCountryChange} className={selectClass}>
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 3. State */}
            <div className="mb-3">
              <label className={labelClass}>State</label>
              <select
                value={state}
                onChange={handleStateChange}
                className={selectClass}
                disabled={states.length === 0}
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 4. Area / LGA */}
            <div>
              <label className={labelClass}>Area / LGA</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={selectClass}
                disabled={areas.length === 0}
              >
                <option value="">All Areas</option>
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 5. Work Mode */}
          <div>
            <label className={labelClass}>Work Mode</label>
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className={selectClass}>
              <option value="">Any Mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          {/* 6. Employment Type */}
          <div>
            <label className={labelClass}>Employment Type</label>
            <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={selectClass}>
              <option value="">Any Type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          {/* 7. Experience Level */}
          <div>
            <label className={labelClass}>Experience Level</label>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className={selectClass}>
              <option value="">Any Level</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Executive / Lead</option>
            </select>
          </div>

          {/* 8. Industry */}
          <div>
            <label className={labelClass}>Industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectClass}>
              <option value="">All Industries</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* 9. Salary Range */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600 mb-3">
              Salary Range ({country === 'Nigeria' ? '₦' : country === 'United States' ? '$' : country === 'United Kingdom' ? '£' : '€'})
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Min</label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>Max</label>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className={inputClass}
                  placeholder="Any"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 10. Date Posted */}
          <div>
            <label className={labelClass}>Date Posted</label>
            <select value={datePosted} onChange={(e) => setDatePosted(e.target.value)} className={selectClass}>
              <option value="">Any Time</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleApply}
            className="flex-1 bg-teal-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-teal-700 transition shadow-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </aside>
  );
}
