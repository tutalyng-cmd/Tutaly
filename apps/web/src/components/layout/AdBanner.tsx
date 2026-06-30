import Image from 'next/image';
import Link from 'next/link';
import { serverFetch } from '@/lib/server-fetch';

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
}

export default async function AdBanner({ placement }: { placement: string }) {
  let activeAds: Ad[] = [];
  try {
    activeAds = await serverFetch<Ad[]>(`ads/active?placement=${placement}`) || [];
  } catch (error) {
    console.warn(`[AdBanner] Failed to fetch ad for placement: ${placement}`);
    return null;
  }

  if (!activeAds || activeAds.length === 0) {
    return null;
  }

  // For simplicity, pick the first active ad for this placement
  const ad = activeAds[0];

  return (
    <div className="w-full bg-c100 dark:bg-c800 border-b dark:border-c700 overflow-hidden relative group">
      <Link href={ad.targetUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center relative min-h-16 md:min-h-24">
          {ad.imageUrl ? (
            <Image 
              src={ad.imageUrl} 
              alt={ad.title || 'Ad'} 
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase tracking-wider text-c500 font-semibold mb-1">Sponsored</span>
              <span className="text-sm md:text-base font-medium text-blue dark:text-blueL group-hover:underline">
                {ad.title}
              </span>
            </div>
          )}
          {ad.imageUrl && (
            <div className="absolute top-1 right-2 bg-black/50 text-white text-xs uppercase px-1.5 py-0.5 rounded backdrop-blur-sm z-10">
              Ad
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
