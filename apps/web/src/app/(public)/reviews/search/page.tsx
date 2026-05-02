import React from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

// This is a minimal mock search result page to support the search form action.
// In a real implementation, you'd fetch matching companies from the API based on the query.

export default async function ReviewSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  
  // Mock results based on query
  const mockResults = [
    { name: 'Paystack', rating: 4.8, reviews: 152 },
    { name: 'Flutterwave', rating: 4.5, reviews: 124 },
    { name: 'Andela', rating: 4.3, reviews: 98 },
    { name: 'Moniepoint', rating: 4.6, reviews: 87 },
    { name: 'Interswitch', rating: 4.1, reviews: 210 },
    { name: 'Kuda', rating: 4.4, reviews: 76 },
  ].filter(company => company.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/reviews" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Reviews
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Search Results for "{query}"
        </h1>

        <form action="/reviews/search" className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="Search for a company..." 
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 shadow-sm text-gray-900 text-lg"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Search
          </button>
        </form>

        <div className="space-y-4">
          {mockResults.length > 0 ? (
            mockResults.map((company, index) => (
              <Link key={index} href={`/reviews/company/${encodeURIComponent(company.name.toLowerCase())}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-teal-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.reviews} reviews • {company.rating} Rating</p>
                    </div>
                  </div>
                  <div className="text-teal-600">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500 mb-6">We couldn't find any companies matching "{query}".</p>
              <Link href="/reviews/write" className="text-teal-600 hover:text-teal-700 font-medium">
                Be the first to write a review for this company
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
