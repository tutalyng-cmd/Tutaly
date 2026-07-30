'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function CompanyNavigationTabs({ companySlug }: { companySlug: string }) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Overview', href: `/reviews/company/${companySlug}` },
    { label: 'Reviews', href: `/reviews/company/${companySlug}/reviews` },
    { label: 'Salaries', href: `/reviews/company/${companySlug}/salaries` },
    { label: 'Q&A', href: `/reviews/company/${companySlug}/questions` },
    { label: 'Jobs', href: `/reviews/company/${companySlug}/jobs` },
  ];

  return (
    <div style={{ borderBottom: '1px solid var(--c-700)', background: 'var(--c-800)' }}>
      <div className="container">
        <nav style={{ display: 'flex', gap: '32px' }}>
          {tabs.map((tab) => {
            // Very simplistic active state
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                style={{
                  padding: '16px 0',
                  color: isActive ? 'var(--c-100)' : 'var(--c-400)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  borderBottom: isActive ? '2px solid var(--green)' : '2px solid transparent',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
