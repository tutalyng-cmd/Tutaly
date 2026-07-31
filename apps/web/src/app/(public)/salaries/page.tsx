import React from 'react';
import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import { 
  SalarySearchHeader, 
  SalaryHeroStatCard, 
  SalaryDistributionChart, 
  TopPayingCompaniesCard 
} from '@/features/salaries';
import { SalariesEngineClient } from '@/features/salaries/components/SalariesEngineClient';

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const titleParam = searchParams.title ? String(searchParams.title) : '';
  
  let metaTitle = "Salary & Compensation Insights | Tutaly";
  if (titleParam) metaTitle = `${titleParam} Salary Insights | Tutaly`;

  return {
    title: metaTitle,
    description: `Discover real, anonymous compensation data. See how your pay compares to the market average for ${titleParam || 'various roles'}.`,
  };
}

export default async function SalariesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const title = searchParams.title ? String(searchParams.title) : '';
  const location = searchParams.location ? String(searchParams.location) : '';

  let aggregateStats = null;
  let topCompanies = [];
  
  if (title) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('title', title);
      if (location) queryParams.append('location', location);
      
      const [statsRes, companiesRes] = await Promise.all([
        serverFetch<any>(`salaries/engine/search?${queryParams.toString()}`, { cache: 'no-store' }),
        serverFetch<any>(`salaries/engine/top-paying-companies?title=${title}`, { cache: 'no-store' })
      ]);
      
      if (statsRes?.data) aggregateStats = statsRes.data;
      if (companiesRes?.data) topCompanies = companiesRes.data;
    } catch (err) {
      console.error('Failed to fetch salary engine data for SSR', err);
    }
  }

  return (
    <div className="min-h-screen bg-navy">
      <SalarySearchHeader initialTitle={title} initialLocation={location} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {title ? (
          <div className="space-y-8">
            {aggregateStats ? (
              <>
                <SalaryHeroStatCard stats={aggregateStats} title={title} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <SalaryDistributionChart stats={aggregateStats} />
                  </div>
                  <div className="lg:col-span-1">
                    <TopPayingCompaniesCard companies={topCompanies} jobTitle={title} />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-c800 border border-c700 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-c700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">No data yet for {title} {location ? `in ${location}` : ''}</h3>
                <p className="text-c400 mb-6 max-w-md mx-auto">
                  We don't have enough verified salaries for this role yet. Be the first to contribute and help others!
                </p>
                <SalariesEngineClient defaultTitle={title} defaultLocation={location} />
              </div>
            )}
            
            {aggregateStats && (
              <div className="flex justify-center pt-8">
                <SalariesEngineClient defaultTitle={title} defaultLocation={location} buttonText="Add Your Salary" />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-c800 border border-c700 rounded-xl p-12 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Search for a job title</h3>
            <p className="text-c400 max-w-md mx-auto mb-6">
              Enter a job title like "Software Engineer" or "Product Manager" to see real compensation data.
            </p>
            <SalariesEngineClient />
          </div>
        )}
      </main>
    </div>
  );
}
