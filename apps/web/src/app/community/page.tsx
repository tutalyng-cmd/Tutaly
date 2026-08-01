import { Metadata } from 'next';
import React, { Suspense } from 'react';
import FeedView from '@/features/community/components/FeedView';

export const metadata: Metadata = {
  title: 'Community | Tutaly',
  description: 'Anonymous workplace discussions, salary insights, and career advice.',
};

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading community feed...</div>}>
      <FeedView />
    </Suspense>
  );
}
