'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Briefcase, Heart, Search, User } from 'lucide-react';

export default function SeekerOverviewPage() {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeekerDetails() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const res = await apiAuth.withToken(token).get('/user/me');
        setUserEmail(res.data.data?.email || 'Professional');
      } catch (err) {
        console.error("Failed to load seeker data", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSeekerDetails();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {loading ? '...' : userEmail}</p>
        </div>
        <Link 
          href="/jobs" 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-all shrink-0"
        >
          <Search className="w-5 h-5" /> Find Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Quick Action Cards */}
        <Link href="/seeker/applications" className="group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-full hover:border-teal-300 hover:shadow-md transition-all">
            <div className="bg-teal-50 p-4 rounded-full text-teal-600 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">My Applications</h3>
            <p className="text-sm text-gray-500 mt-2">Track the status of roles you have applied for.</p>
          </div>
        </Link>
        
        <Link href="/seeker/saved" className="group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-full hover:border-red-200 hover:shadow-md transition-all">
            <div className="bg-red-50 p-4 rounded-full text-red-600 mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Saved Jobs</h3>
            <p className="text-sm text-gray-500 mt-2">View the opportunities you bookmarked for later.</p>
          </div>
        </Link>

        {/* Profile Completion Call to Action */}
        <Link href="/seeker" className="group sm:col-span-2 lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900 to-primary-light rounded-xl shadow-lg border border-gray-800 p-6 flex flex-col items-center justify-center text-center h-full hover:shadow-xl transition-all relative overflow-hidden">
             {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
            
            <div className="bg-white/10 p-4 rounded-full text-white mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Update Profile</h3>
            <p className="text-sm text-gray-300 mt-2">Keep your CV and skills updated to stand out to employers.</p>
          </div>
        </Link>
      </div>

    </div>
  );
}
