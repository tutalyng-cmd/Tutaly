import React from 'react';
import Link from 'next/link';
import { Star, Building2, Search, ArrowRight, ShieldCheck, ThumbsUp } from 'lucide-react';
import { api } from '@/lib/api';

// This is a Server Component. It fetches data on the server.
async function getTopCompanies() {
  try {
    // We don't have an endpoint for ALL companies aggregates list yet, 
    // so we might just render a static list of popular companies or 
    // if we had an endpoint we'd fetch it here.
    // For now, we will mock popular companies to showcase the UI, and allow searching.
    return [
      { name: 'Paystack', rating: 4.8, reviews: 152 },
      { name: 'Flutterwave', rating: 4.5, reviews: 124 },
      { name: 'Andela', rating: 4.3, reviews: 98 },
      { name: 'Moniepoint', rating: 4.6, reviews: 87 },
      { name: 'Interswitch', rating: 4.1, reviews: 210 },
      { name: 'Kuda', rating: 4.4, reviews: 76 },
    ];
  } catch (error) {
    console.error('Failed to fetch top companies:', error);
    return [];
  }
}

export default async function ReviewsPage() {
  const topCompanies = await getTopCompanies();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero Section */}
      <section className="bg-navy py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-400 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Discover Real Company Culture in Nigeria
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Read anonymous reviews from verified employees. Make informed decisions about your next career move.
          </p>

          <form action="/reviews/search" className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                name="q"
                placeholder="Search for a company (e.g., Paystack, Flutterwave)" 
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 shadow-lg text-gray-900 text-lg"
                required
              />
            </div>
            <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-colors flex items-center gap-2 shrink-0 text-lg">
              Search
            </button>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-teal-500" /> 100% Anonymous</span>
            <span className="flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-teal-500" /> Verified Submissions</span>
          </div>
        </div>
      </section>

      {/* Popular Companies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Popular Companies</h2>
            <p className="text-gray-500 mt-2">Companies with the most reviews on Tutaly.</p>
          </div>
          <Link href="/reviews/write" className="text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 group">
            Write a Review <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCompanies.map((company, index) => (
            <Link key={index} href={`/reviews/company/${encodeURIComponent(company.name.toLowerCase())}`} className="group block">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:border-teal-200 transition-all duration-300 transform group-hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 className="w-7 h-7 text-gray-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-700 font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                    {company.rating} <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-teal-600 font-medium">
                  Read Reviews
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="mt-20 bg-gradient-to-r from-teal-50 to-blue-50 rounded-3xl p-10 text-center border border-teal-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Help Others Make Better Career Choices</h3>
            <p className="text-gray-600 mb-8 text-lg">Your review is 100% anonymous and helps thousands of Nigerian professionals find the right company culture.</p>
            <Link 
              href="/reviews/write" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-teal-500 hover:-translate-y-1 transition-all"
            >
              Write an Anonymous Review
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
