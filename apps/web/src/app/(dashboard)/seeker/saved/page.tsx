'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Trash2 } from 'lucide-react';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/jobs/saved');
      const jobs = res.data.data ? res.data.data.map((item: any) => item.job || item) : [];
      setSavedJobs(jobs);
    } catch (err) {
      console.error('Failed to fetch saved jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/jobs/${jobId}/save`);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (err) {
      alert('Failed to remove saved job');
    }
  };

  const getLogoColors = (companyName: string) => {
    const char = companyName.charAt(0).toUpperCase();
    const hash = char.charCodeAt(0) % 3;
    if (hash === 0) return { background: 'rgba(29,122,58,0.18)', color: '#2DB85A' };
    if (hash === 1) return { background: 'rgba(27,79,158,0.18)', color: 'var(--blue-l)' };
    return { background: 'rgba(201,162,39,0.18)', color: 'var(--gold-h)' };
  };

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="section__title" style={{ fontSize: '28px', marginBottom: '8px' }}>Saved Jobs</h1>
        <p className="section__subtitle" style={{ marginBottom: 0 }}>Opportunities you've bookmarked for later.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-500)' }}>Loading saved jobs...</div>
      ) : savedJobs.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty__icon">❤️</div>
          <div className="dash-empty__title">No saved jobs yet</div>
          <div className="dash-empty__desc">When you see a job you like but aren't ready to apply, save it here to easily find it later.</div>
          <Link href="/jobs" className="btn btn--primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="joblist">
          {savedJobs.map((job) => {
            const companyName = job.employer?.employerProfile?.companyName || 'Company';
            const logoColors = getLogoColors(companyName);

            return (
              <article key={job.id} className="jobcard">
                <div className="jobcard__logo" style={logoColors}>
                  {companyName.charAt(0).toUpperCase()}
                </div>
                <div className="jobcard__body">
                  <div className="jobcard__top">
                    <div>
                      <Link href={`/jobs/${job.id}`} className="hover:text-blue-l" style={{ display: 'block', transition: 'color 150ms' }}>
                        <div className="jobcard__title">{job.title}</div>
                      </Link>
                      <div className="jobcard__company">{companyName}</div>
                    </div>
                    <button 
                      className="jobcard__save" 
                      onClick={() => handleUnsave(job.id)}
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="jobcard__meta">
                    <span>📍 {job.state || 'Location'}, {job.country || 'NG'}</span>
                    <span>💼 {job.employmentType}</span>
                    {job.minSalary && (
                      <span className="jobcard__salary">{job.currency || 'NGN'} {Number(job.minSalary).toLocaleString()}</span>
                    )}
                  </div>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="jobcard__tags">
                      {job.skills.slice(0, 4).map((skill: string, idx: number) => (
                        <span key={idx} className="tag">{skill}</span>
                      ))}
                      {job.skills.length > 4 && (
                        <span style={{ fontSize: '11px', color: 'var(--c-500)', padding: '4px 0' }}>+{job.skills.length - 4} more</span>
                      )}
                    </div>
                  )}

                  <div className="jobcard__footer">
                    <div className="jobcard__posted">
                      {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <Link href={`/jobs/${job.id}`} className="btn btn--sm btn--primary">View details</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
