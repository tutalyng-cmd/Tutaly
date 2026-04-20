'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function DashboardRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function determineRoute() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/signin');
        return;
      }

      try {
        // Fetch user context from backend user module
        const res = await apiAuth.withToken(token).get('/user/me');
        const user = res.data.data; // Custom backend wrapper
        
        switch (user.role) {
          case 'admin':
            router.replace('/admin');
            break;
          case 'employer':
            router.replace('/employer');
            break;
          case 'seeker':
            router.replace('/seeker');
            break;
          default:
            router.replace('/');
            break;
        }
      } catch {
        // Token invalid or expired
        localStorage.removeItem('access_token');
        router.replace('/auth/signin');
      }
    }

    determineRoute();
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
      <h2 className="text-xl font-medium text-gray-700">Loading your workspace...</h2>
    </div>
  );
}
