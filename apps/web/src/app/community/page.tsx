import { Metadata } from 'next';
import React, { Suspense } from 'react';
import CommunityFeatureLayout from '@/features/community/components/CommunityFeatureLayout';

export const metadata: Metadata = {
  title: 'Community | Tutaly',
  description: 'Anonymous workplace discussions, salary insights, and career advice.',
};

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading community...</div>}>
      <CommunityFeatureLayout />
    </Suspense>
  );
}
