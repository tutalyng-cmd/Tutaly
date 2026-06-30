"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AdData {
  id: string;
  image_url: string;
  target_url: string;
  type: string;
}

export default function AdBanner({ placement }: { placement: string }) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real scenario, this would call GET /api/ads/active?placement=...
    // Currently, mocking the fetch call:
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads/active?placement=${placement}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Select random ad for this placement
            const randomAd = data[Math.floor(Math.random() * data.length)];
            setAd(randomAd);
          }
        } else {
          // Fallback to mock data for presentation purposes if backend route isn't returning correctly
          setTimeout(() => {
            setAd({
              id: 'mock-1',
              image_url: 'https://placehold.co/1200x90/1B4F9E/FFFFFF?text=Promote+Your+Business+Here',
              target_url: '/advertise',
              type: 'banner'
            });
          }, 500);
        }
      } catch (e) {
        console.error("Error fetching ad", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  if (isLoading) {
    return (
      <div className="w-full h-24 bg-c900 animate-pulse rounded-xl mb-8 flex items-center justify-center">
        <span className="text-c700 text-sm">Loading advertisement...</span>
      </div>
    );
  }

  if (!ad) return null; // Collapse if no ad exists

  return (
    <div className="relative w-full max-w-6xl mx-auto mb-10 overflow-hidden rounded-xl border border-c800 group shadow-lg">
      <Link href={ad.target_url} target="_blank" rel="noopener noreferrer">
        <div className="absolute top-2 right-2 bg-c900/80 backdrop-blur-sm text-c300 text-xs uppercase font-bold tracking-widest px-2 py-1 rounded-sm z-10">
          Sponsored
        </div>
        <div className="w-full h-24 md:h-32 relative bg-c900">
          <Image 
            src={ad.image_url}
            alt="Advertisement"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized={ad.image_url.includes('placehold.co')} // allow placeholder images to render without next/image optimization issues
          />
        </div>
      </Link>
    </div>
  );
}
