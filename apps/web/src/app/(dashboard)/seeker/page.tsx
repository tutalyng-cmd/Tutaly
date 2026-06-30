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
          <h1 className="text-3xl font-extrabold text-c100">Your Dashboard</h1>
          <p className="text-c400 mt-2">Welcome back, {loading ? '...' : (profile?.firstName ? `${profile.firstName} ${profile.lastName}` : userEmail)}</p>
        </div>
        <Link 
          href="/jobs" 
          className="btn btn--primary shrink-0"
        >
          <Search className="w-5 h-5" /> Find Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Quick Action Cards */}
        <Link href="/seeker/applications" className="group block">
          <div className="bg-c800 rounded-xl border border-c700 p-6 flex flex-col items-center justify-center text-center h-full transition-all hover:border-blue hover:shadow-glow-blue">
            <div className="bg-green/20 p-4 rounded-full text-green mb-4 transition-transform duration-200 group-hover:scale-110">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-c100">My Applications</h3>
            <p className="text-sm text-c400 mt-2">Track the status of roles you have applied for.</p>
          </div>
        </Link>
        
        <Link href="/seeker/saved" className="group block">
          <div className="bg-c800 rounded-xl border border-c700 p-6 flex flex-col items-center justify-center text-center h-full transition-all hover:border-red hover:shadow-md">
            <div className="bg-red/15 p-4 rounded-full text-red mb-4 transition-transform duration-200 group-hover:scale-110">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-c100">Saved Jobs</h3>
            <p className="text-sm text-c400 mt-2">View the opportunities you bookmarked for later.</p>
          </div>
        </Link>

        {/* Profile Completion Card */}
        <Link href="/seeker/profile" className="group block sm:col-span-2 lg:col-span-1">
          <div className="bg-blue shadow-glow-blue rounded-xl border border-blue p-6 flex flex-col h-full relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue opacity-10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="bg-blue/20 p-3 rounded-md text-blueL">
                <User className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-c100">{completionScore}%</span>
                <p className="text-xs text-blueL">Profile complete</p>
              </div>
            </div>
            
            <div className="w-full bg-c800 rounded-full h-2 mb-4">
              <div className="bg-blue h-2 rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${completionScore}%` }}></div>
            </div>

            <div className="mt-auto space-y-2 relative z-10">
              {completionScore < 100 ? (
                <>
                  {!profile?.headline && <p className="text-sm text-c300 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-goldH" /> Add a headline</p>}
                  {!profile?.resumeUrl && <p className="text-sm text-c300 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-goldH" /> Upload your CV</p>}
                  <p className="text-sm font-semibold text-blueL mt-2 flex items-center gap-1">Complete Profile &rarr;</p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-green">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Your profile is looking great!</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
