import React, { Suspense } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Clock, Search } from 'lucide-react';
import JobFilterSidebar from '@/components/jobs/JobFilterSidebar';

async function fetchJobs(searchParams: { [key: string]: string | string[] | undefined }) {
  const query = new URLSearchParams();
  Object.keys(searchParams).forEach((key) => {
    if (searchParams[key]) query.append(key, String(searchParams[key]));
  });

  try {
    const res = await fetch(`http://localhost:3000/api/jobs?${query.toString()}`, {
      cache: 'no-store', // Since we want real-time filtering
    });
    if (!res.ok) return { items: [], meta: { total: 0 } };
    return await res.json();
  } catch (error) {
    return { items: [], meta: { total: 0 } };
  }
}

export default async function JobsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { items: jobs, meta } = await fetchJobs(searchParams);

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Next Role</h1>
          <p className="text-gray-500 mt-2">Showing {meta?.total || 0} active jobs</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <Suspense fallback={<div className="w-full lg:w-1/4 h-32 animate-pulse bg-gray-200 rounded-xl"></div>}>
            <JobFilterSidebar />
          </Suspense>

          {/* Results List (Left Panel) */}
          <div className="w-full lg:w-2/4 space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                No jobs found matching your criteria. Try loosening your filters.
              </div>
            ) : (
              jobs.map((job: any) => (
                <Link href={`?jobId=${job.id}`} key={job.id} scroll={false}>
                  <div className={`bg-white p-6 rounded-xl border transition cursor-pointer hover:shadow-md ${searchParams.jobId === job.id ? 'border-teal-500 shadow-md ring-1 ring-teal-500' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{job.employer?.email || 'Confidential Company'}</p>
                      </div>
                      {job.isFeatured && (
                        <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded">Featured</span>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.area ? `${job.area}, ` : ''}{job.state}</div>
                      <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.jobType}</div>
                      {job.minSalary && (
                        <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.minSalary.toLocaleString()} - {job.maxSalary?.toLocaleString() || '+'}</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Detail View (Right Panel) */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="sticky top-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[500px]">
              {searchParams.jobId ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {jobs.find((j: any) => j.id === searchParams.jobId)?.title || 'Job Details'}
                  </h2>
                  <div className="mb-6 flex gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">Quick Apply</span>
                  </div>
                  <p className="text-gray-600">
                    {jobs.find((j: any) => j.id === searchParams.jobId)?.description || 'Select a job to view more details.'}
                  </p>
                  <button className="mt-8 w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-black transition shadow-lg shadow-gray-900/20">
                    Apply Now
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <Briefcase className="w-12 h-12 mb-4 text-gray-300" />
                  <p>Select a job from the list to view details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
