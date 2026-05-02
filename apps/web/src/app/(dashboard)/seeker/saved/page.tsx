'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Loader2, Heart, MapPin, Briefcase, DollarSign, Building2, ExternalLink, Trash2 } from 'lucide-react';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/jobs/saved');
      // The API might return an array of SavedJob entities. We need to map them to the job objects.
      const jobs = res.data.data ? res.data.data.map((item: any) => item.job || item) : [];
      setSavedJobs(jobs);
    } catch (err) {
      console.error('Failed to fetch saved jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/jobs/${jobId}/save`);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (err) {
      alert('Failed to remove saved job');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 mt-1">Opportunities you've bookmarked for later.</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <Heart className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No saved jobs yet</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            When you see a job you like but aren't ready to apply, save it here to easily find it later.
          </p>
          <Link 
            href="/jobs" 
            className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {savedJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group flex flex-col sm:flex-row gap-6">
              
              {/* Company Logo or Icon */}
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>

              {/* Job Details */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                  <div>
                    <Link href={`/jobs/${job.id}`} className="hover:underline">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    </Link>
                    <p className="text-teal-600 font-medium">{job.employer?.employerProfile?.companyName || 'Company'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      View <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleUnsave(job.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.state || 'Location'}, {job.country || 'NG'}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.employmentType}</span>
                  {job.minSalary && (
                    <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {job.currency || 'NGN'} {Number(job.minSalary).toLocaleString()}</span>
                  )}
                </div>
                
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((skill: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-xs text-gray-400 py-1">+{job.skills.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
