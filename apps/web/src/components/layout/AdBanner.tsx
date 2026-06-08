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
  try {
    const activeAds = await serverFetch<Ad[]>(`ads/active?placement=${placement}`);
    
    if (!activeAds || activeAds.length === 0) {
      return null;
    }

    // For simplicity, pick the first active ad for this placement
    const ad = activeAds[0];

    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 overflow-hidden relative group">
        <Link href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center relative min-h-[60px] md:min-h-[90px]">
            {ad.imageUrl ? (
              <Image 
                src={ad.imageUrl} 
                alt={ad.title} 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Sponsored</span>
                <span className="text-sm md:text-base font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                  {ad.title}
                </span>
              </div>
            )}
            {ad.imageUrl && (
              <div className="absolute top-1 right-2 bg-black/50 text-white text-[10px] uppercase px-1.5 py-0.5 rounded backdrop-blur-sm z-10">
                Ad
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  } catch (error) {
    // Fail silently if ad service is down
    console.warn(`[AdBanner] Failed to fetch ad for placement: ${placement}`);
    return null;
  }
}
