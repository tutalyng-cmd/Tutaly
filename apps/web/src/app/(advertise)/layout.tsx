import { ReactNode } from 'react';
import AdsPortalShell from '@/components/ads/AdsPortalShell';

export default function AdvertiseLayout({ children }: { children: ReactNode }) {
  return <AdsPortalShell>{children}</AdsPortalShell>;
}
