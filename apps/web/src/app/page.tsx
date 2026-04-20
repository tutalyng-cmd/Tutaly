import Link from 'next/link';
import Hero from '@/components/home/Hero';
import { Briefcase, MapPin, ArrowRight } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  jobType: string;
  workMode: string;
  country: string;
  state: string;
  area?: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  employer?: { email: string };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

async function fetchFeaturedJobs(): Promise<Job[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/jobs?isFeatured=true&limit=6`,
      { next: { revalidate: 300 } } // ISR: revalidate every 5 minutes
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function fetchStats() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/jobs?limit=1`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return { total: 0 };
    const data = await res.json();
    return { total: data.meta?.total || 0 };
  } catch {
    return { total: 0 };
  }
}

export default async function Home() {
  const [featuredJobs, stats] = await Promise.all([
    fetchFeaturedJobs(),
    fetchStats(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Featured Jobs Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Opportunities</h2>
              <p className="mt-1 text-gray-500">Hand-picked high-priority roles across Nigeria.</p>
            </div>
            <Link
              href="/jobs"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 transition"
            >
              View all jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="border border-gray-100 p-12 rounded-xl bg-gray-50 text-center">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">Featured jobs will appear here once employers promote their listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <Link href={`/jobs?jobId=${job.id}`} key={job.id}>
                  <div className="border border-gray-100 p-6 rounded-xl bg-white hover:shadow-lg hover:border-teal-200 transition-all duration-200 cursor-pointer group h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition">{job.title}</h3>
                      <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0 ml-2">
                        Featured
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{job.employer?.email || 'Confidential'}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.area ? `${job.area}, ` : ''}{job.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {job.jobType}
                      </span>
                      {job.minSalary && (
                        <span className="font-medium text-gray-700">
                          {CURRENCY_SYMBOLS[job.currency] || job.currency}{job.minSalary.toLocaleString()}
                          {job.maxSalary ? ` - ${CURRENCY_SYMBOLS[job.currency] || job.currency}${job.maxSalary.toLocaleString()}` : '+'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/jobs" className="text-sm font-medium text-teal-600 hover:text-teal-800">
              View all jobs →
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="bg-primary-dark py-12 text-white border-y border-primary-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">{stats.total > 0 ? `${stats.total}+` : '—'}</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Active Jobs</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">50+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Companies</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">1k+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Members</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">200+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Salaries</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
