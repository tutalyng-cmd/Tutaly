'use client';

import React, { useState } from 'react';
import { INDUSTRIES } from '@/lib/constants';

export function ReviewGlobalSidebar() {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="filters__header" style={{ marginBottom: '24px' }}>
          <span className="filters__title" style={{ fontSize: '18px', fontWeight: 'bold' }}>Explore companies</span>
          <button className="filters__clear" style={{ background: 'transparent', color: 'var(--blue-h)', fontSize: '13px' }}>Clear filters</button>
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Company</label>
          <input type="text" placeholder="Select a company" className="filter-input" />
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Location</label>
          <input type="text" placeholder="Select a location" className="filter-input" />
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Industries</label>
          <input type="text" placeholder="E.g. healthcare, internet, education" className="filter-input" />
          <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '8px' }}>
            {INDUSTRIES.map(ind => (
              <label key={ind} className="filter-option">
                <span className="filter-checkbox"></span> {ind}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Job title</label>
          <input type="text" placeholder="Select a job title" className="filter-input" />
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Job function</label>
          <input type="text" placeholder="Select a job function" className="filter-input" />
        </div>

        <hr className="filter-divider" />

        <div className="filter-group">
          <label className="filter-group__label" style={{ marginBottom: '4px' }}>Company ratings by category</label>
          <div style={{ fontSize: '12px', color: 'var(--c-400)', marginBottom: '12px' }}>and up • select only one</div>
          
          <label className="filter-group__label" style={{ fontSize: '13px', color: 'var(--c-200)', marginTop: '12px' }}>Workplace factor ratings</label>
          {RATINGS.map(rating => (
            <label key={rating} className="filter-option">
              <span className="filter-radio"></span> {rating}
            </label>
          ))}

          <label className="filter-group__label" style={{ fontSize: '13px', color: 'var(--c-200)', marginTop: '16px' }}>Demographic group ratings</label>
          {DEMOGRAPHICS.map(demo => (
            <label key={demo} className="filter-option">
              <span className="filter-radio"></span> {demo}
            </label>
          ))}
        </div>

        <hr className="filter-divider" />

        <div className="filter-group">
          <label className="filter-group__label">Global company size</label>
          {COMPANY_SIZES.map(size => (
            <label key={size} className="filter-option">
              <span className="filter-checkbox"></span> {size}
            </label>
          ))}
        </div>

        <hr className="filter-divider" />

        <div className="filter-group">
          <label className="filter-group__label">Explore similar searches</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <a href="#" style={{ color: 'var(--blue-h)', fontSize: '13px', textDecoration: 'none' }}>Top companies for Culture & values</a>
            <a href="#" style={{ color: 'var(--blue-h)', fontSize: '13px', textDecoration: 'none' }}>Top companies for Diversity & inclusion</a>
          </div>
        </div>
      </aside>
    </>
  );
}
