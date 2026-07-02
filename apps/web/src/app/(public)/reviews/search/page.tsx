import React from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

import { serverFetch } from '@/lib/server-fetch';

export default async function ReviewSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  
  let searchResults = [];

  try {
    const res = await serverFetch<any>(`reviews/companies/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    searchResults = res?.data || [];
  } catch (err) {
    console.error('Failed to fetch search results', err);
  }

  return (
    <div className="min-h-screen bg-c100 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/reviews" className="inline-flex items-center gap-2 text-sm text-c500 hover:text-green mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Reviews
        </Link>

        <h1 className="text-3xl font-bold text-c900 mb-6">
          Search Results for "{query}"
        </h1>

        <form action="/reviews/search" className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-c400 w-5 h-5" />
          <input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="Search for a company..." 
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-c200 focus:ring-2 focus:ring-green shadow-sm text-c900 text-lg"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-green hover:bg-green text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Search
          </button>
        </form>

        <div className="space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map((company: any, index: number) => (
              <Link key={index} href={`/reviews/company/${encodeURIComponent(company.companyName.toLowerCase())}`} className="block bg-white rounded-xl shadow-sm border border-c200 p-6 hover:shadow-md hover:border-green transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-c100 border border-c100 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-c400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-c900">{company.companyName}</h3>
                      <p className="text-sm text-c500">{company.totalReviews} reviews • {company.avgOverall} Rating</p>
                    </div>
                  </div>
                  <div className="text-green">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-c200">
              <Building2 className="w-12 h-12 text-c300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-c900 mb-2">No companies found</h3>
              <p className="text-c500 mb-6">We couldn't find any companies matching "{query}".</p>
              <Link href="/reviews/write" className="text-green hover:text-green font-medium">
                Be the first to write a review for this company
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
