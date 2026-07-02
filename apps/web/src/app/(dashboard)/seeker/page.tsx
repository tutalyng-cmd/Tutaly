'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Megaphone,
  ChevronRight,
  Bookmark,
  Check,
  Circle
} from 'lucide-react';

export default function SeekerOverviewPage() {
  return (
    <>
      <Link href="/advertise" className="ad-banner" aria-label="Run an ad — promote your profile or listings to employers and buyers">
        <div className="ad-banner__left">
          <div className="ad-banner__icon">
            <Megaphone className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="ad-banner__title">Get seen by more employers</div>
            <div className="ad-banner__desc">Run a targeted ad to promote your profile or marketplace listings — starts at ₦5,000.</div>
          </div>
        </div>
        <div className="ad-banner__cta">
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--gold-h)' }}>Create an ad</span>
          <ChevronRight className="ad-banner__arrow w-4 h-4" />
        </div>
      </Link>

      <div className="dcard" style={{ background: 'linear-gradient(135deg, rgba(27,79,158,0.14), rgba(201,162,39,0.06))', borderColor: 'var(--c-700)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '4px' }}>Welcome back 👋</div>
            <div style={{ fontSize: '13px', color: 'var(--c-400)' }}>You have 3 active applications and 12 new job matches this week.</div>
          </div>
          <Link href="/jobs" className="btn btn--primary btn--sm">Browse new matches</Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Applications</div>
          <div className="stat-card__value">24</div>
          <div className="stat-card__delta up">↑ 6 this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Profile views</div>
          <div className="stat-card__value">312</div>
          <div className="stat-card__delta up">↑ 18% this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Saved jobs</div>
          <div className="stat-card__value">9</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Profile strength</div>
          <div className="stat-card__value" style={{ color: 'var(--gold-h)' }}>82%</div>
        </div>
      </div>

      <div className="overview-grid">
        {/* LEFT COLUMN */}
        <div>
          <div className="dcard">
            <div className="dcard__header">
              <div>
                <div className="dcard__title">Recent applications</div>
                <div className="dcard__sub">Your latest activity</div>
              </div>
              <Link href="/seeker/applications" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--blue-l)' }}>View all →</Link>
            </div>

            <div className="app-row">
              <div className="app-row__logo" style={{ background: 'rgba(29,122,58,0.18)', color: '#2DB85A' }}>P</div>
              <div className="app-row__body">
                <div className="app-row__title">Senior Product Manager</div>
                <div className="app-row__meta">Paystack · Lagos, Nigeria</div>
              </div>
              <div className="app-row__status"><span className="status--offer" style={{ padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Offer</span></div>
            </div>
            <div className="app-row">
              <div className="app-row__logo" style={{ background: 'rgba(27,79,158,0.18)', color: 'var(--blue-l)' }}>F</div>
              <div className="app-row__body">
                <div className="app-row__title">Backend Engineer (Node.js)</div>
                <div className="app-row__meta">Flutterwave · Lagos, Nigeria</div>
              </div>
              <div className="app-row__status"><span className="status--interview" style={{ padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Interview</span></div>
            </div>
            <div className="app-row" style={{ marginBottom: 0 }}>
              <div className="app-row__logo" style={{ background: 'rgba(201,162,39,0.18)', color: 'var(--gold-h)' }}>A</div>
              <div className="app-row__body">
                <div className="app-row__title">Data Scientist</div>
                <div className="app-row__meta">Andela · Remote, Global</div>
              </div>
              <div className="app-row__status"><span className="status--review" style={{ padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>In review</span></div>
            </div>
          </div>

          <div className="dcard">
            <div className="dcard__header">
              <div>
                <div className="dcard__title">Recommended for you</div>
                <div className="dcard__sub">Based on your profile and skills</div>
              </div>
              <Link href="/jobs" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--blue-l)' }}>See more →</Link>
            </div>
            <div className="joblist">
              <article className="jobcard" style={{ padding: '16px' }}>
                <div className="jobcard__logo" style={{ width: '40px', height: '40px', fontSize: '15px', background: 'rgba(204,43,43,0.14)', color: '#F05050' }}>N</div>
                <div className="jobcard__body">
                  <div className="jobcard__top">
                    <div>
                      <div className="jobcard__title" style={{ fontSize: '14px' }}>Staff Software Engineer</div>
                      <div className="jobcard__company">Novalink</div>
                    </div>
                    <button className="jobcard__save" aria-label="Save job" style={{ width: '28px', height: '28px' }}>
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="jobcard__meta">
                    <span>📍 Remote, Global</span>
                    <span className="jobcard__salary">$95,000 – $135,000</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="dcard">
            <div className="dcard__title" style={{ marginBottom: '14px' }}>Profile strength</div>
            <div className="salary-bar-track" style={{ marginBottom: '8px' }}>
              <div className="salary-bar-fill" style={{ width: '82%', background: 'linear-gradient(90deg, rgba(201,162,39,0.5), var(--gold))' }}></div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--c-500)', marginBottom: '16px' }}>Add your work experience to reach 100%.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderTop: '1px solid var(--c-700)' }}>
              <Check className="w-3.5 h-3.5" stroke="#2DB85A" strokeWidth={3} />
              <span style={{ fontSize: '12.5px', color: 'var(--c-300)' }}>Resume uploaded</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
              <Check className="w-3.5 h-3.5" stroke="#2DB85A" strokeWidth={3} />
              <span style={{ fontSize: '12.5px', color: 'var(--c-300)' }}>Skills added</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
              <Circle className="w-3.5 h-3.5" stroke="var(--c-500)" />
              <span style={{ fontSize: '12.5px', color: 'var(--c-500)' }}>Work experience missing</span>
            </div>
            <Link href="/seeker/profile" className="btn btn--ghost btn--sm btn--full" style={{ marginTop: '14px' }}>Complete profile</Link>
          </div>

          <div className="dcard">
            <div className="dcard__title" style={{ marginBottom: '14px' }}>Your salary insight</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '26px', fontWeight: 600, color: '#2DB85A', marginBottom: '2px' }}>₦820K</div>
            <div style={{ fontSize: '11.5px', color: 'var(--c-500)', marginBottom: '14px' }}>Median for Product Manager, Lagos</div>
            <Link href="/salaries" className="btn btn--ghost btn--sm btn--full">Explore salary data</Link>
          </div>
        </div>
      </div>
    </>
  );
}
