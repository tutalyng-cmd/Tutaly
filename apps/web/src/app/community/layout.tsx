import React from 'react';
import CommunityTabs from '@/features/community/components/CommunityTabs';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-c900">
      {/* Hero Strip */}
      <header className="px-8 pt-[104px] pb-7 max-w-[1360px] mx-auto">
        <div className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-[#F5B942] font-semibold mb-3.5 before:content-[''] before:w-[18px] before:h-[1px] before:bg-[#F5B942]">
          CONNECT
        </div>
        <h1 className="font-sans text-[32px] font-bold tracking-tight leading-tight mb-2.5 text-white">
          Build your professional network.
        </h1>
        <p className="text-c400 text-[15px] max-w-[600px] leading-relaxed">
          Follow industry leaders, join communities, and stay visible to the people who matter — backed by real salary and company data.
        </p>
      </header>

      {/* Tabs */}
      <CommunityTabs />

      {/* Page Content */}
      <div className="max-w-[1360px] mx-auto pb-16">
        {children}
      </div>
    </div>
  );
}
