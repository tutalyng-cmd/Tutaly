import React from 'react';
import CommunityTabs from '@/features/community/components/CommunityTabs';
import './community.css';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="page active" id="page-community">
      <header className="hero">
        <div className="eyebrow">CONNECT</div>
        <h1>Build your professional network.</h1>
        <p>Follow industry leaders, join communities, and stay visible to the people who matter — backed by real salary and company data.</p>
      </header>

      <CommunityTabs />

      {children}
    </section>
  );
}
