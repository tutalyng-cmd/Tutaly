'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Briefcase, Heart, Search, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SeekerOverviewPage() {
  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeekerDetails() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const [meRes, profileRes] = await Promise.all([
          apiAuth.withToken(token).get('/user/me'),
          apiAuth.withToken(token).get('/user/seeker/profile')
        ]);
        
        setUserEmail(meRes.data.data?.email || 'Professional');
        setProfile(profileRes.data);
      } catch (err) {
        console.error("Failed to load seeker data", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSeekerDetails();
  }, []);

  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.firstName && profile.lastName) score += 20;
    if (profile.headline) score += 20;
    if (profile.bio) score += 20;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.resumeUrl) score += 20;
    return score;
  };

  const completionScore = calculateCompletion();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {loading ? '...' : (profile?.firstName ? `${profile.firstName} ${profile.lastName}` : userEmail)}</p>
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

        {/* Profile Completion Card */}
        <Link href="/seeker/profile" className="group sm:col-span-2 lg:col-span-1">
          <div className="bg-gradient-to-br from-navy to-blue-900 rounded-xl shadow-lg border border-gray-800 p-6 flex flex-col h-full hover:shadow-xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="bg-white/10 p-3 rounded-xl text-white">
                <User className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{completionScore}%</span>
                <p className="text-xs text-blue-200">Profile complete</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-teal-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${completionScore}%` }}></div>
            </div>

            <div className="mt-auto space-y-2 relative z-10">
              {completionScore < 100 ? (
                <>
                  {!profile?.headline && <p className="text-sm text-blue-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-yellow-400" /> Add a headline</p>}
                  {!profile?.resumeUrl && <p className="text-sm text-blue-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-yellow-400" /> Upload your CV</p>}
                  <p className="text-sm font-semibold text-white mt-2 flex items-center gap-1 group-hover:text-teal-300 transition-colors">Complete Profile →</p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-teal-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Your profile is looking great!</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
