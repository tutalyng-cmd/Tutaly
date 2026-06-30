'use client';

import React, { useEffect, useState } from 'react';
import { serverFetch } from '@/lib/server-fetch';
import Link from 'next/link';

export default function FeaturedJobsCarousel() {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    // We'll just try to get an active ad for 'jobs_sidebar' or any 'sponsored_job' 
    // In a real scenario, the backend should return jobs filtered by format 'sponsored_job'
    const fetchFeaturedJob = async () => {
      try {
        const res = await fetch('/api/ads/active?placement=jobs_sidebar');
        if (res.ok) {
          const data = await res.json();
          if (data.ad && data.ad.format === 'sponsored_job') {
            setAd(data.ad);
            // Log impression
            await fetch('/api/ads/impression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ campaignId: data.ad.id })
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeaturedJob();
  }, []);

  if (!ad) return null;

  const handleClick = async () => {
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: ad.id })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group floatcard border border-goldH bg-gold/10 p-6 relative overflow-hidden mb-8">
      <div className="absolute top-4 right-4 bg-goldH text-xs font-extrabold px-2 py-1 rounded text-black uppercase tracking-wider flex items-center gap-1">
        ⭐ Featured
      </div>
      <h3 className="text-xl font-extrabold text-c100 mb-2">Sponsored Opportunity</h3>
      <p className="text-c300 mb-4 max-w-layout-md leading-relaxed">
        This is a featured job position. Apply now to fast-track your application!
      </p>
      
      {/* If it's linked to a specific job ID we can link directly, else fallback to target URL */}
      <Link 
        href={ad.job_id ? `/jobs?jobId=${ad.job_id}` : ad.target_url || '#'}
        onClick={handleClick}
        className="btn bg-goldH text-black border-none"
      >
        View Details &rarr;
      </Link>
    </div>
  );
}
