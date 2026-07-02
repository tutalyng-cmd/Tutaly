'use client';

import React, { useState, useEffect } from 'react';
import { apiAuth } from '@/lib/api';
import Link from 'next/link';

interface SubApplication {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    jobType: string;
    workMode: string;
    area: string;
    state: string;
    country: string;
    employer: {
      email: string;
    };
  };
}

export default function SeekerApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<SubApplication[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Active');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const { data } = await apiAuth.withToken(token).get('/jobs/seeker/applications');
      setApplications(data);
    } catch (e) {
      const err = e as any;
      setError(err instanceof Error ? err.message : 'Failed to fetch your applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPLIED':
        return { className: 'status--review', style: { padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, background: 'rgba(201,162,39,0.2)', color: 'var(--gold-h)' } };
      case 'REVIEWING':
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return { className: 'status--interview', style: { padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, background: 'rgba(27,79,158,0.2)', color: 'var(--blue-l)' } };
      case 'OFFERED':
        return { className: 'status--offer', style: { padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, background: 'rgba(29,122,58,0.2)', color: '#2DB85A' } };
      case 'REJECTED':
        return { className: '', style: { padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, background: 'rgba(204,43,43,0.12)', color: '#F05050' } };
      default:
        return { className: '', style: { padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, background: 'var(--c-700)', color: 'var(--c-300)' } };
    }
  };

  // Mock logo colors based on company name
  const getLogoColors = (companyName: string) => {
    const char = companyName.charAt(0).toUpperCase();
    const hash = char.charCodeAt(0) % 3;
    if (hash === 0) return { background: 'rgba(29,122,58,0.18)', color: '#2DB85A' };
    if (hash === 1) return { background: 'rgba(27,79,158,0.18)', color: 'var(--blue-l)' };
    return { background: 'rgba(201,162,39,0.18)', color: 'var(--gold-h)' };
  };

  // Filtering logic
  const activeApps = applications.filter(a => !['REJECTED', 'OFFERED'].includes(a.status.toUpperCase()));
  const interviewApps = applications.filter(a => ['REVIEWING', 'SHORTLISTED', 'INTERVIEW'].includes(a.status.toUpperCase()));
  const offerApps = applications.filter(a => a.status.toUpperCase() === 'OFFERED');
  const archivedApps = applications.filter(a => a.status.toUpperCase() === 'REJECTED');

  let displayedApps = activeApps;
  if (activeTab === 'Interviews') displayedApps = interviewApps;
  if (activeTab === 'Offers') displayedApps = offerApps;
  if (activeTab === 'Archived') displayedApps = archivedApps;

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="section__title" style={{ fontSize: '28px', marginBottom: '8px' }}>Applications</h1>
        <p className="section__subtitle" style={{ marginBottom: 0 }}>Track the status of jobs you have applied to.</p>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(204,43,43,0.12)', color: '#F05050', borderRadius: 'var(--r-lg)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="app-tabs">
        <div className={`app-tab ${activeTab === 'Active' ? 'active' : ''}`} onClick={() => setActiveTab('Active')}>
          Active <span className="app-tab__count">{activeApps.length}</span>
        </div>
        <div className={`app-tab ${activeTab === 'Interviews' ? 'active' : ''}`} onClick={() => setActiveTab('Interviews')}>
          Interviews <span className="app-tab__count">{interviewApps.length}</span>
        </div>
        <div className={`app-tab ${activeTab === 'Offers' ? 'active' : ''}`} onClick={() => setActiveTab('Offers')}>
          Offers <span className="app-tab__count">{offerApps.length}</span>
        </div>
        <div className={`app-tab ${activeTab === 'Archived' ? 'active' : ''}`} onClick={() => setActiveTab('Archived')}>
          Archived <span className="app-tab__count">{archivedApps.length}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-500)' }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty__icon">💼</div>
          <div className="dash-empty__title">No applications yet</div>
          <div className="dash-empty__desc">You haven't applied to any jobs. Explore active listings to find your next role.</div>
          <Link href="/jobs" className="btn btn--primary">Explore Jobs</Link>
        </div>
      ) : displayedApps.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty__title">No {activeTab.toLowerCase()} applications</div>
          <div className="dash-empty__desc">Check back later or view your other tabs.</div>
        </div>
      ) : (
        <div>
          {displayedApps.map((app) => {
            const companyName = app.job.employer.email.split('@')[0];
            const logoColors = getLogoColors(companyName);
            const statusStyle = getStatusStyle(app.status);
            
            return (
              <div key={app.id} className="app-row">
                <div className="app-row__logo" style={logoColors}>
                  {companyName.charAt(0).toUpperCase()}
                </div>
                <div className="app-row__body">
                  <Link href={`/jobs?jobId=${app.job.id}`} className="app-row__title hover:text-blue-l" style={{ display: 'block', transition: 'color 150ms' }}>
                    {app.job.title}
                  </Link>
                  <div className="app-row__meta">
                    {companyName} Company · {app.job.area ? `${app.job.area}, ` : ''}{app.job.state}
                  </div>
                </div>
                <div className="app-row__status">
                  <span className={statusStyle.className} style={statusStyle.style}>{app.status}</span>
                </div>
                <div className="app-row__date">
                  {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
