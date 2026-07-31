import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/server-fetch';
import { SalariesEngineClient } from '@/features/salaries/components/SalariesEngineClient';
import {
  SalaryHeroStatCard,
  SalaryDistributionChart,
  TopPayingCompaniesCard
} from '@/features/salaries';

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const titleParam = searchParams.title ? String(searchParams.title) : '';
  
  let metaTitle = "Salary & Compensation Insights | Tutaly";
  if (titleParam) metaTitle = `${titleParam} Salary Insights | Tutaly`;

  return {
    title: metaTitle,
    description: `Discover real, anonymous compensation data. See how your pay compares to the market average for ${titleParam || 'various roles'}.`,
  };
}

/* ─── STATIC BROWSE DATA ─────────────────────────────────── */
const POPULAR_ROLES = [
  { title: 'Software Engineer', slug: 'software-engineer' },
  { title: 'Product Manager', slug: 'product-manager' },
  { title: 'Data Analyst', slug: 'data-analyst' },
  { title: 'UI/UX Designer', slug: 'ui-ux-designer' },
  { title: 'DevOps Engineer', slug: 'devops-engineer' },
  { title: 'Marketing Manager', slug: 'marketing-manager' },
  { title: 'Sales Executive', slug: 'sales-executive' },
  { title: 'Customer Success Manager', slug: 'customer-success-manager' },
  { title: 'Backend Developer', slug: 'backend-developer' },
  { title: 'Frontend Developer', slug: 'frontend-developer' },
  { title: 'Finance Manager', slug: 'finance-manager' },
  { title: 'HR Specialist', slug: 'hr-specialist' },
];

const POPULAR_LOCATIONS = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu'
];

export default async function SalariesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const title = searchParams.title ? String(searchParams.title) : '';
  const location = searchParams.location ? String(searchParams.location) : '';

  let aggregateStats = null;
  let topCompanies: any[] = [];
  let popularRoles: any[] = [];
  let recentSalaries: any[] = [];

  // Always fetch popular roles and recent salaries for the landing state
  try {
    const [popRes, recentRes] = await Promise.all([
      serverFetch<any>('salaries/roles/popular?limit=12', { cache: 'no-store' }).catch(() => null),
      serverFetch<any>('salaries?limit=6', { cache: 'no-store' }).catch(() => null),
    ]);
    popularRoles = popRes?.data || [];
    recentSalaries = recentRes?.data || [];
  } catch { /* swallow */ }

  // If a title search is active, fetch the engine stats
  if (title) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('title', title);
      if (location) queryParams.append('location', location);

      const [statsRes, companiesRes] = await Promise.all([
        serverFetch<any>(`salaries/engine/search?${queryParams.toString()}`, { cache: 'no-store' }),
        serverFetch<any>(`salaries/engine/top-paying-companies?title=${title}`, { cache: 'no-store' })
      ]);

      if (statsRes?.data) aggregateStats = statsRes.data;
      if (companiesRes?.data) topCompanies = companiesRes.data;
    } catch (err) {
      console.error('Failed to fetch salary engine data for SSR', err);
    }
  }

  return (
    <div className="page-shell">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Salary Intelligence</div>
          <h1 className="page-header__title">Know your worth. Negotiate with data.</h1>
          <p className="page-header__sub">Anonymous, crowdsourced compensation data for Nigerian professionals.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
            <form action="/salaries" className="company-search" role="search" aria-label="Salary search" style={{ flex: 1, margin: 0, minWidth: '300px' }}>
              <input
                type="text"
                name="title"
                defaultValue={title}
                placeholder="Job title (e.g. Software Engineer)"
                aria-label="Search job title"
                required
              />
              <input
                type="text"
                name="location"
                defaultValue={location}
                placeholder="Location (optional)"
                aria-label="Location"
                style={{ borderLeft: '1px solid var(--c-600)' }}
              />
              <button type="submit">Search</button>
            </form>
            <SalariesEngineClient buttonVariant="primary" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="container" style={{ padding: '32px 0 80px' }}>

        {title ? (
          /* ── SEARCH RESULTS STATE ────────────────────────────── */
          <div>
            {aggregateStats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SalaryHeroStatCard stats={aggregateStats} title={title} />
                <div className="layout-split" style={{ gridTemplateColumns: '1fr 360px', padding: 0, alignItems: 'start' }}>
                  <SalaryDistributionChart stats={aggregateStats} />
                  <TopPayingCompaniesCard companies={topCompanies} jobTitle={title} />
                </div>

                <div style={{ textAlign: 'center', paddingTop: '24px' }}>
                  <SalariesEngineClient defaultTitle={title} defaultLocation={location} buttonText="Add Your Salary" buttonVariant="primary" />
                </div>
              </div>
            ) : (
              <div className="dash-empty" style={{ padding: '60px 20px', border: '1px solid var(--c-700)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                <div className="dash-empty__title" style={{ color: 'var(--c-100)' }}>No data yet for &ldquo;{title}&rdquo;{location ? ` in ${location}` : ''}</div>
                <p style={{ color: 'var(--c-400)', maxWidth: '460px', margin: '12px auto 24px', fontSize: '14px' }}>
                  We don&apos;t have enough verified salaries for this role yet. Be the first to contribute and help others negotiate fairly.
                </p>
                <SalariesEngineClient defaultTitle={title} defaultLocation={location} buttonText="Submit a Salary" buttonVariant="primary" />
              </div>
            )}
          </div>
        ) : (
          /* ── LANDING / BROWSE STATE ──────────────────────────── */
          <div>
            {/* Browse by Role */}
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '20px', letterSpacing: '-0.02em' }}>Browse Salaries by Role</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {POPULAR_ROLES.map((role) => (
                  <Link
                    key={role.slug}
                    href={`/salaries?title=${encodeURIComponent(role.title)}`}
                    style={{
                      background: 'var(--c-800)',
                      border: '1px solid var(--c-700)',
                      borderRadius: 'var(--r-lg)',
                      padding: '16px 20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--c-200)',
                      transition: 'border-color 150ms, background 150ms',
                    }}
                    className="salary-role-card"
                  >
                    {role.title}
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--c-500)', fontWeight: 400, marginTop: '4px' }}>
                      View salary data →
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Browse by Location */}
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '20px', letterSpacing: '-0.02em' }}>Browse by Location</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {POPULAR_LOCATIONS.map((loc) => (
                  <Link
                    key={loc}
                    href={`/salaries?title=Software+Engineer&location=${encodeURIComponent(loc)}`}
                    className="btn btn--ghost"
                    style={{ fontSize: '13px', padding: '8px 18px' }}
                  >
                    {loc}
                  </Link>
                ))}
              </div>
            </section>

            {/* Popular Roles from DB */}
            {popularRoles.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '20px', letterSpacing: '-0.02em' }}>Trending Roles</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {popularRoles.map((role: any) => (
                    <Link
                      key={role.role}
                      href={`/salaries?title=${encodeURIComponent(role.role)}`}
                      style={{
                        background: 'var(--c-800)',
                        border: '1px solid var(--c-700)',
                        borderRadius: 'var(--r-lg)',
                        padding: '20px',
                        transition: 'border-color 150ms',
                      }}
                      className="salary-role-card"
                    >
                      <div style={{ fontWeight: 700, color: 'var(--c-100)', fontSize: '15px', marginBottom: '8px' }}>{role.role}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--c-400)' }}>{role.totalSubmissions} submissions</span>
                        <span style={{ color: 'var(--blue-l)', fontWeight: 600 }}>
                          ₦{Number(role.avgSalary).toLocaleString()} avg
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Submissions */}
            {recentSalaries.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '20px', letterSpacing: '-0.02em' }}>Recent Submissions</h2>
                <div className="review-list">
                  {recentSalaries.map((sal: any) => (
                    <article key={sal.id} className="review-full reveal visible" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--c-100)', fontSize: '15px' }}>{sal.role || sal.job_title || 'Unknown Role'}</div>
                          <div style={{ fontSize: '13px', color: 'var(--c-400)', marginTop: '4px' }}>{sal.industry || sal.location || '—'} · {sal.location || '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--c-100)', fontSize: '16px' }}>
                            ₦{Number(sal.salaryAmount || sal.base_pay || 0).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--c-500)' }}>{sal.salaryPeriod || sal.pay_period || 'yearly'}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section style={{
              background: 'var(--c-800)',
              border: '1px solid var(--c-700)',
              borderRadius: 'var(--r-lg)',
              padding: '40px',
              textAlign: 'center',
            }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '8px' }}>Help others negotiate fairly</h2>
              <p style={{ fontSize: '14px', color: 'var(--c-400)', maxWidth: '480px', margin: '0 auto 24px' }}>
                Your anonymous salary submission helps thousands of professionals know their worth. It takes 30 seconds.
              </p>
              <SalariesEngineClient buttonText="Submit Your Salary" buttonVariant="primary" />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
