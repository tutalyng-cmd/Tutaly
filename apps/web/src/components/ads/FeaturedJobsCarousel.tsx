'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FeaturedJobsCarousel({ placement = 'jobs_top' }: { placement?: string }) {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    const fetchFeaturedJob = async () => {
      try {
        const res = await fetch(`/api/ads/active?placement=${placement}`);
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
  }, [placement]);

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
    <div className="dcard border border-gold bg-gold-10 p-6 relative overflow-hidden mb-8">
      <div className="absolute top-4 right-4 bg-gold text-xs font-bold px-2 py-1 rounded text-white uppercase tracking-wider flex items-center gap-1 shadow-glow-gold">
        ⭐ Featured
      </div>
      <h3 className="text-xl font-bold text-c100 mb-2">{ad.alt_text || 'Sponsored Opportunity'}</h3>
      <p className="text-c300 mb-4 max-w-layout-md leading-relaxed text-sm">
        This is a featured job position. Apply now to fast-track your application!
      </p>
      
      <Link 
        href={ad.job_id ? `/jobs?jobId=${ad.job_id}` : ad.destination_url || '#'}
        onClick={handleClick}
        className="btn bg-gold hover:bg-gold-h text-white border-none font-bold"
      >
        View Details &rarr;
      </Link>
    </div>
  );
}
