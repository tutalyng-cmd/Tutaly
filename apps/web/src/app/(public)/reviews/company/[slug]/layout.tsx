import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';

import { CompanyHeader } from '@/components/reviews/CompanyHeader';
import { CompanyNavigationTabs } from '@/components/reviews/CompanyNavigationTabs';

export const metadata: Metadata = {
  title: 'Company Profile',
};

export default async function CompanyProfileLayout(props: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  let company = null;

  try {
    const res = await serverFetch<any>(`companies/${slug}`, { cache: 'no-store' });
    if (res?.success && res?.data) {
      company = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch company', err);
  }

  if (!company) {
    notFound();
  }

  return (
    <div className="page-shell">
      <CompanyHeader company={company} />
      <CompanyNavigationTabs companySlug={slug} />
      {props.children}
    </div>
  );
}
