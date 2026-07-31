import React from 'react';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  // The new Glassdoor-style Community Engine manages its own layout inside CommunityFeatureLayout
  return <>{children}</>;
}
