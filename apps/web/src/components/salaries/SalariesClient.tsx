'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';



interface SalariesClientProps {
  salaries: any[];
  aggregates: any[];
  popularRoles?: any[];
}

export default function SalariesClient({ salaries, aggregates, popularRoles = [] }: SalariesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [roleInput, setRoleInput] = useState(searchParams.get('role') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (roleInput) params.set('role', roleInput);
    router.push(`/salaries?${params.toString()}`);
  };

  const featured = aggregates.length > 0 ? aggregates[0] : null;

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Salary intelligence</div>
          <h1 className="page-header__title">Know what you&apos;re worth before you walk in.</h1>
          <p className="page-header__sub">Real pay data from verified professionals, in your currency.</p>
          <form className="hero__search" onSubmit={handleSearch} style={{ marginTop: '20px', maxWidth: '640px' }}>
            <div className="hero__search-field">
              <Search className="w-5 h-5" style={{ color: 'var(--c-400)' }} />
              <input 
                type="text" 
                placeholder="Search a job title..." 
                aria-label="Search salary by job title"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
              />
            </div>
            <button type="submit" className="hero__search-btn">Check Salary</button>
          </form>
        </div>
      </header>

      <div className="container" style={{ padding: '32px 0 80px' }}>
        
        {featured && (
          <div className="salary-card reveal visible" style={{ maxWidth: '100%', marginBottom: '48px' }}>
            <div className="salary-card__header">
              <div>
                <div className="salary-card__role">{featured.role || featured.industry || 'All Roles'}</div>
                <div className="salary-card__loc">📍 Lagos, Nigeria · All experience levels · {featured.totalSubmissions || 0} reports</div>
              </div>
              <div>
                <div className="salary-card__avg">₦{(Number(featured.avgSalary) / 1000).toFixed(0)}K</div>
                <div className="salary-card__avg-label">median / month</div>
              </div>
            </div>
            <div className="salary-bar-wrap">
              <div className="salary-bar-labels">
                <span>₦{((Number(featured.avgSalary) * 0.7) / 1000).toFixed(0)}K (10th)</span>
                <span>Median</span>
                <span>₦{((Number(featured.avgSalary) * 1.5) / 1000).toFixed(0)}K (90th)</span>
              </div>
              <div className="salary-bar-track">
                <div className="salary-bar-fill" style={{ width: '58%' }}>
                  <div className="salary-bar-marker"></div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <span className="badge badge-success">↑ 12% vs last year</span>
              <span className="badge badge-muted">Updated this week</span>
            </div>
          </div>
        )}

        <div className="layout-split" style={{ padding: 0 }}>
          {/* FILTERS */}
          <aside className="filters" aria-label="Salary filters">
            <div className="filters__header">
              <span className="filters__title">Refine</span>
              <span className="filters__clear">Clear all</span>
            </div>
            <div className="filter-group">
              <div className="filter-group__label">Location</div>
              <label className="filter-option checked"><span className="filter-checkbox"></span> Lagos <span className="filter-count">1,840</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Abuja <span className="filter-count">612</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Remote, Global <span className="filter-count">2,310</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> London <span className="filter-count">490</span></label>
            </div>
            <div className="filter-group">
              <div className="filter-group__label">Experience</div>
              <label className="filter-option"><span className="filter-checkbox"></span> 0–2 years <span className="filter-count">820</span></label>
              <label className="filter-option checked"><span className="filter-checkbox"></span> 3–6 years <span className="filter-count">1,840</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> 7–10 years <span className="filter-count">940</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> 10+ years <span className="filter-count">310</span></label>
            </div>
            <div className="filter-group">
              <div className="filter-group__label">Company size</div>
              <label className="filter-option"><span className="filter-checkbox"></span> Startup (1–50) <span className="filter-count">680</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Mid-size (51–500) <span className="filter-count">1,120</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Enterprise (500+) <span className="filter-count">410</span></label>
            </div>
          </aside>

          {/* BROWSE ROLES */}
          <main aria-label="Browse roles">
            <div className="results-bar">
              <p className="results-count">Browse by <strong>role</strong></p>
              <div className="results-sort">
                Sort by
                <select aria-label="Sort roles">
                  <option>Highest paying</option>
                  <option>Most reported</option>
                  <option>Alphabetical</option>
                </select>
              </div>
            </div>

            <div className="role-grid reveal visible">
              {(aggregates.length > 0 && (aggregates.length > 1 || searchParams.get('role'))) ? aggregates.map((agg, idx) => (
                <div key={idx} className="role-tile">
                  <div>
                    <div className="role-tile__name">{agg.role || searchParams.get('role') || 'All Roles'}</div>
                    <div className="role-tile__count">{agg.totalSubmissions || 0} reported salaries</div>
                  </div>
                  <div className="role-tile__salary">
                    {agg.minSalary && agg.maxSalary 
                      ? `₦${(Number(agg.minSalary) / 1000).toFixed(0)}K–₦${(Number(agg.maxSalary) / 1000).toFixed(0)}K`
                      : `₦${(Number(agg.avgSalary) / 1000).toFixed(0)}K/mo`}
                  </div>
                </div>
              )) : popularRoles.map((role, idx) => (
                <div key={idx} className="role-tile">
                  <div>
                    <div className="role-tile__name">{role.role}</div>
                    <div className="role-tile__count">{role.totalSubmissions} reports</div>
                  </div>
                  <div className="role-tile__salary">
                    {role.minSalary && role.maxSalary 
                      ? `₦${(Number(role.minSalary) / 1000).toFixed(0)}K–₦${(Number(role.maxSalary) / 1000).toFixed(0)}K`
                      : `₦${(Number(role.avgSalary) / 1000).toFixed(0)}K/mo`}
                  </div>
                </div>
              ))}
              {aggregates.length === 0 && searchParams.get('role') && (
                <div style={{ color: 'var(--c-500)', padding: '20px 0' }}>No salary data found for this query.</div>
              )}
            </div>

            <div style={{ marginTop: '40px', padding: '28px', background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-100)', marginBottom: '6px' }}>Don&apos;t see your role?</p>
              <p style={{ fontSize: '13px', color: 'var(--c-400)', marginBottom: '18px' }}>Add your salary anonymously and help the next person negotiate better.</p>
              <Link href="/salaries/submit" className="btn btn--primary">Add Your Salary</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
