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
    <div className="bg-white rounded-2xl shadow-sm border border-c100 overflow-hidden relative group mt-4">
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-xs text-white font-bold px-1.5 py-0.5 rounded tracking-wider uppercase z-10">
        Ad
      </div>
      <a 
        href={ad.target_url || '#'} 
        onClick={handleClick}
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {ad.image_url ? (
          <div className="aspect-video bg-c100 relative">
            <img src={ad.image_url} alt="Advertisement" className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="aspect-video bg-blue shadow-glow-blue flex flex-col items-center justify-center p-6 text-center border-b border-c100">
            <h4 className="font-bold text-c900 mb-2">{ad.format.replace('_', ' ').toUpperCase()}</h4>
            <p className="text-sm text-c600">Promote your business here to thousands of professionals.</p>
          </div>
        )}
        <div className="p-3 bg-c100/50 group-hover:bg-c100 transition-colors">
          <p className="text-xs text-c500 font-medium truncate">Sponsored via Tutaly Ads</p>
        </div>
      </a>
    </div>
  );
}
