"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AdData {
  id: string;
  image_url: string;
  target_url: string;
  type: string;
  title?: string;
}

export default function AdBanner({ placement }: { placement: string }) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await api.get(`/ads/active?placement=${placement}`);
        if (res.data && res.data.length > 0) {
          const randomAd = res.data[Math.floor(Math.random() * res.data.length)];
          setAd(randomAd);
        }
      } catch (e) {
        console.error('Error fetching ad', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  if (isLoading) {
    return (
      <div className="w-full h-24 bg-c900 animate-pulse rounded-xl mb-8 flex items-center justify-center">
        <span className="sr-only">Loading sponsored content</span>
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div className="relative w-full max-w-6xl mx-auto mb-10 overflow-hidden rounded-xl border border-c800 group shadow-lg">
      <Link href={ad.target_url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`Sponsored: ${ad.title || ad.type}. Opens in a new tab.`}>
        <div className="absolute top-2 right-2 bg-c900/80 backdrop-blur-sm text-c300 text-xs uppercase font-bold tracking-widest px-2 py-1 rounded-sm z-10">
          Sponsored
        </div>
        <div className="w-full h-24 md:h-32 relative bg-c900">
          <Image
            src={ad.image_url}
            alt={ad.title || `Sponsored ${ad.type} advertisement`}
            fill
            className="object-cover"
          />
        </div>
      </Link>
    </div>
  );
}
