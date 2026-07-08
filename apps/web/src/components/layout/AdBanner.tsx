import Image from 'next/image';
import Link from 'next/link';
import { serverFetch } from '@/lib/server-fetch';

interface Ad {
  id: string;
  alt_text: string;
  image_url: string;
  destination_url: string;
  format: string;
  placement: string;
}

export default async function AdBanner({ placement }: { placement: string }) {
  let ad: Ad | null = null;
  try {
    const res = await serverFetch<{ ad: Ad | null }>(`/ads/active?placement=${placement}`);
    if (res && res.ad) {
      ad = res.ad;
    }
  } catch (error) {
    console.warn(`[AdBanner] Failed to fetch ad for placement: ${placement}`);
    return null;
  }

  if (!ad) {
    return null;
  }

  return (
    <div className="w-full bg-c800 border-b border-c700 overflow-hidden relative group">
      <Link href={ad.destination_url || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center relative min-h-16 md:min-h-24">
          {ad.image_url ? (
            <Image 
              src={ad.image_url} 
              alt={ad.alt_text || 'Advertisement'} 
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <span className="text-xs uppercase tracking-widest text-c500 font-bold mb-1">Sponsored</span>
              <span className="text-sm font-bold text-c200 group-hover:text-blue-l transition-colors">
                {ad.alt_text || 'Promote your business here'}
              </span>
            </div>
          )}
          {ad.image_url && (
            <div className="absolute top-1 right-2 bg-c900/60 backdrop-blur-md text-c100 text-xs font-bold uppercase px-1.5 py-0.5 rounded z-10 border border-c700/50">
              Ad
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
