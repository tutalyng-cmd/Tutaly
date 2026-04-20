'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';

export default function Hero() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location.trim()) params.set('state', location.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Empowering Careers, <br />
            <span className="text-accent-teal uppercase">Connecting Nigeria.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            The #1 platform for jobs, company reviews, salary insights, and professional networking.
            All in one professional workspace.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl md:flex">
          <div className="flex flex-grow items-center px-4 py-3 md:border-r">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job Title or Keyword"
              className="ml-2 w-full border-none bg-transparent text-gray-900 focus:ring-0 focus:outline-none"
            />
          </div>
          <div className="flex flex-grow items-center px-4 py-3 md:border-r">
            <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Lagos)"
              className="ml-2 w-full border-none bg-transparent text-gray-900 focus:ring-0 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-teal px-8 py-3 font-bold text-white transition-all hover:bg-opacity-90 md:w-auto rounded-xl md:rounded-none"
          >
            Search
          </button>
        </form>

        {/* Dual CTA */}
        <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
          <Link
            href="/jobs"
            className="w-full rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition-all hover:bg-white hover:text-primary sm:w-auto text-center"
          >
            Find a Job
          </Link>
          <Link
            href="/employer/jobs/create"
            className="w-full rounded-full bg-white px-8 py-3 font-semibold text-primary transition-all hover:bg-gray-100 sm:w-auto text-center"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </section>
  );
}
