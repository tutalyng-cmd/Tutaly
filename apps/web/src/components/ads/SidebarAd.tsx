'use client';

import React, { useEffect, useState } from 'react';

export default function SidebarAd({ placement }: { placement: string }) {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/active?placement=${placement}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ad) {
            setAd(data.ad);
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
    fetchAd();
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
    <div className="bg-c800 rounded-xl border border-c700 overflow-hidden relative group mt-4">
      <div className="absolute top-2 right-2 bg-c900/60 backdrop-blur-md text-xs text-c100 font-bold px-1.5 py-0.5 rounded tracking-wider uppercase z-10 border border-c700/50">
        Ad
      </div>
      <a 
        href={ad.destination_url || '#'} 
        onClick={handleClick}
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {ad.image_url ? (
          <div className="aspect-video bg-c700 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.image_url} alt={ad.alt_text || "Advertisement"} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="aspect-video bg-blue/10 flex flex-col items-center justify-center p-6 text-center border-b border-c700">
            <h4 className="font-bold text-blue-l mb-2">{ad.format ? ad.format.replace('_', ' ').toUpperCase() : 'ADVERTISEMENT'}</h4>
            <p className="text-xs text-c400">{ad.alt_text || "Promote your business here to thousands of professionals."}</p>
          </div>
        )}
        <div className="p-3 bg-c800 group-hover:bg-c700 transition-colors border-t border-c700">
          <p className="text-xs text-c400 font-medium truncate group-hover:text-c200 transition-colors">Sponsored via Tutaly Ads</p>
        </div>
      </a>
    </div>
  );
}
