'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterMeta {
  industries: string[];
  locations: Record<string, Record<string, string[]>>;
}

export default function JobFilterSidebar({ filterMeta }: { filterMeta?: FilterMeta }) {
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
  const locations = filterMeta?.locations || {};
  const industriesList = filterMeta?.industries || [];
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

  return (
    <aside className="filters" aria-label="Job filters">
      <div className="filters__header">
        <span className="filters__title">Filters</span>
        <span className="filters__clear" onClick={handleClear}>Clear all</span>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Keyword / Title</div>
        <div className="filter-range">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. Frontend Developer"
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Location</div>
        <div className="flex flex-col gap-2">
          <div className="filter-range">
            <select value={country} onChange={handleCountryChange} className="w-full bg-c700 border border-c600 rounded-sm py-2 px-2 text-xs font-mono text-c100 outline-none focus:border-blue">
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="filter-range">
            <select value={state} onChange={handleStateChange} disabled={states.length === 0} className="w-full bg-c700 border border-c600 rounded-sm py-2 px-2 text-xs font-mono text-c100 outline-none focus:border-blue disabled:opacity-50">
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="filter-range">
            <select value={area} onChange={(e) => setArea(e.target.value)} disabled={areas.length === 0} className="w-full bg-c700 border border-c600 rounded-sm py-2 px-2 text-xs font-mono text-c100 outline-none focus:border-blue disabled:opacity-50">
              <option value="">All Areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Work Mode</div>
        <label className={`filter-option ${workMode === '' ? 'checked' : ''}`} onClick={() => setWorkMode('')}>
          <span className="filter-checkbox"></span> Any Mode
        </label>
        <label className={`filter-option ${workMode === 'remote' ? 'checked' : ''}`} onClick={() => setWorkMode('remote')}>
          <span className="filter-checkbox"></span> Remote
        </label>
        <label className={`filter-option ${workMode === 'hybrid' ? 'checked' : ''}`} onClick={() => setWorkMode('hybrid')}>
          <span className="filter-checkbox"></span> Hybrid
        </label>
        <label className={`filter-option ${workMode === 'onsite' ? 'checked' : ''}`} onClick={() => setWorkMode('onsite')}>
          <span className="filter-checkbox"></span> On-site
        </label>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Employment Type</div>
        <div className="filter-range">
          <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full bg-c700 border border-c600 rounded-sm py-2 px-2 text-xs font-mono text-c100 outline-none focus:border-blue">
            <option value="">Any Type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Experience Level</div>
        <div className="filter-range">
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full bg-c700 border border-c600 rounded-sm py-2 px-2 text-xs font-mono text-c100 outline-none focus:border-blue">
            <option value="">Any Level</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Executive / Lead</option>
          </select>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Industry</div>
        <div className="filter-range">
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-c700 border border-c600 rounded-sm py-2 px-2 text-xs font-mono text-c100 outline-none focus:border-blue">
            <option value="">All Industries</option>
            {industriesList.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Salary Range</div>
        <div className="filter-range">
          <input
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder="Min"
            min="0"
          />
          <span style={{ color: 'var(--c-500)' }}>–</span>
          <input
            type="number"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder="Max"
            min="0"
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__label">Date Posted</div>
        <div className="filter-range">
          <select value={datePosted} onChange={(e) => setDatePosted(e.target.value)} className="w-full bg-c700 border border-c600 rounded-sm py-2 px-2 text-xs font-mono text-c100 outline-none focus:border-blue">
            <option value="">Any Time</option>
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleApply} className="btn btn--primary w-full">
          Apply Filters
        </button>
      </div>
    </aside>
  );
}
