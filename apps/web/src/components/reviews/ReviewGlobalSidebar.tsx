'use client';

import React, { useState } from 'react';
import { INDUSTRIES } from '@/lib/constants';
import { useRouter, useSearchParams } from 'next/navigation';

export function ReviewGlobalSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const industry = searchParams.get('industry') || '';
  const location = searchParams.get('location') || '';
  const size = searchParams.get('size') || '';

  // Filter sections as requested
  const RATINGS = [
    'Culture & values',
    'Diversity & inclusion',
    'Work/life balance',
    'Compensation and benefits',
    'Career opportunities',
    'Senior management'
  ];

  const DEMOGRAPHICS = [
    'Race/Ethnicity',
    'Gender',
    'Sexual orientation',
    'People with disabilities',
    'Parent or family caregiver',
    'Veterans'
  ];

  const COMPANY_SIZES = [
    '1 - 50',
    '51 - 200',
    '201 - 500',
    '501 - 1000',
    '1001 - 5000',
    '5001 - 10000',
    '10000+',
    'Any size'
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-filter-toggle btn btn--ghost" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', marginBottom: '16px', display: 'none' }}
      >
        {isOpen ? 'Close Filters' : 'Filter Companies'}
      </button>

      {/* Sidebar Content */}
      <aside className={`filters ${isOpen ? 'is-open' : ''}`} aria-label="Review filters">
        <form action="/reviews/search" method="GET">
          <div className="filters__header" style={{ marginBottom: '24px' }}>
            <span className="filters__title" style={{ fontSize: '18px', fontWeight: 'bold' }}>Explore companies</span>
            <div>
              <a href="/reviews" className="filters__clear" style={{ marginRight: '16px', textDecoration: 'none' }}>Clear filters</a>
              <button type="submit" style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>Apply</button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Company</label>
            <input type="text" name="q" defaultValue={q} placeholder="Select a company" className="filter-input" />
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Location</label>
            <input type="text" name="location" defaultValue={location} placeholder="Select a location" className="filter-input" />
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Industries</label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
              {INDUSTRIES.map(ind => (
                <label key={ind} className="filter-option">
                  <input type="radio" name="industry" value={ind} defaultChecked={industry === ind} className="filter-checkbox" style={{ appearance: 'auto', width: '16px', height: '16px' }} /> 
                  <span style={{ marginLeft: '8px' }}>{ind}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="filter-divider" />

          <div className="filter-group">
            <label className="filter-group__label" style={{ marginBottom: '4px' }}>Company ratings by category</label>
            <div style={{ fontSize: '12px', color: 'var(--c-400)', marginBottom: '12px' }}>and up • select only one</div>
            
            <label className="filter-group__label" style={{ fontSize: '13px', color: 'var(--c-200)', marginTop: '12px' }}>Workplace factor ratings</label>
            {RATINGS.map(rating => (
              <label key={rating} className="filter-option">
                <input type="radio" name="ratingCategory" value={rating} className="filter-radio" style={{ appearance: 'auto' }} /> 
                <span style={{ marginLeft: '8px' }}>{rating}</span>
              </label>
            ))}

            <label className="filter-group__label" style={{ fontSize: '13px', color: 'var(--c-200)', marginTop: '16px' }}>Demographic group ratings</label>
            {DEMOGRAPHICS.map(demo => (
              <label key={demo} className="filter-option">
                <input type="radio" name="demographicCategory" value={demo} className="filter-radio" style={{ appearance: 'auto' }} /> 
                <span style={{ marginLeft: '8px' }}>{demo}</span>
              </label>
            ))}
          </div>

          <hr className="filter-divider" />

          <div className="filter-group">
            <label className="filter-group__label">Global company size</label>
            {COMPANY_SIZES.map(s => (
              <label key={s} className="filter-option">
                <input type="radio" name="size" value={s} defaultChecked={size === s} className="filter-checkbox" style={{ appearance: 'auto', width: '16px', height: '16px' }} /> 
                <span style={{ marginLeft: '8px' }}>{s}</span>
              </label>
            ))}
          </div>
        </form>
      </aside>
    </>
  );
}
