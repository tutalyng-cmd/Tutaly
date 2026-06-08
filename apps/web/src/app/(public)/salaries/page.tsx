import React from 'react';
import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import SalariesClient from '@/components/salaries/SalariesClient';

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const role = searchParams.role ? String(searchParams.role) : '';
  const industry = searchParams.industry ? String(searchParams.industry) : '';
  
  let title = "Salary Intelligence";
  if (role && industry) title = `${role} Salaries in ${industry}`;
  else if (role) title = `${role} Salaries`;
  else if (industry) title = `${industry} Salaries`;

  return {
    title,
    description: `Discover real, anonymous compensation data for ${role || industry || 'various'} roles across Nigerian industries. Know your worth on Tutaly.`,
  };
}

export default async function SalariesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const queryParams = new URLSearchParams();
  if (searchParams.industry) queryParams.append('industry', String(searchParams.industry));
  if (searchParams.role) queryParams.append('role', String(searchParams.role));

  let salaries = [];
  let aggregates = [];

  try {
    const [aggRes, salRes] = await Promise.all([
      serverFetch<any>(`salaries/aggregates?${queryParams.toString()}`, { cache: 'no-store' }),
      serverFetch<any>(`salaries?${queryParams.toString()}`, { cache: 'no-store' })
    ]);
    aggregates = aggRes?.data || [];
    salaries = salRes?.data || [];
  } catch (err) {
    console.error('Failed to fetch salary data for SSR', err);
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <SalariesClient salaries={salaries} aggregates={aggregates} />
    </div>
  );
}
