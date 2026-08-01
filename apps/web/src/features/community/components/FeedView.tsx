'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FeedSidebarLeft from './FeedSidebarLeft';
import FeedSidebarRight from './FeedSidebarRight';
import PostComposerTrigger from './PostComposerTrigger';
import ThreadCard from './ThreadCard';
import { communityService } from '../api/community.service';
import { CommunityThread } from '../types/community.types';
import { api } from '@/lib/api';

export default function FeedView() {
  const searchParams = useSearchParams();
  const currentBowlSlug = searchParams.get('bowl');

  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'following'>('global');
  
  // User info for composer
  const [userInitials, setUserInitials] = useState<string>('MW');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await api.get('/user/profile');
          const first = res.data.data.firstName || '';
          const last = res.data.data.lastName || '';
          setUserInitials(`${first.charAt(0)}${last.charAt(0)}`.toUpperCase());
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchUser();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const threadsRes = await communityService.getFeed({
        bowlSlug: currentBowlSlug || undefined,
        tab: activeTab,
        page: 1,
        limit: 20
      });
      setThreads(threadsRes.data);
    } catch (err) {
      console.error('Failed to load community feed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBowlSlug, activeTab]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_280px] gap-6 items-start">
      {/* Left Sidebar */}
      <FeedSidebarLeft />

      {/* Center Feed */}
      <div className="flex flex-col gap-4.5 min-w-0">
        {/* Global/Following Segmented Control */}
        <div className="flex gap-1 p-1 bg-c900 border border-c700 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('global')}
            className={`px-4.5 py-2 rounded-[9px] text-[13.5px] font-semibold border-0 transition-colors ${activeTab === 'global' ? 'bg-c700 text-white' : 'bg-transparent text-c500 hover:text-white'}`}
          >
            Global
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`px-4.5 py-2 rounded-[9px] text-[13.5px] font-semibold border-0 transition-colors ${activeTab === 'following' ? 'bg-c700 text-white' : 'bg-transparent text-c500 hover:text-white'}`}
          >
            Following
          </button>
        </div>

        {isLoggedIn ? (
          <PostComposerTrigger 
            onClick={() => {}} 
            userInitials={userInitials} 
          />
        ) : (
          <div className="bg-c800 rounded-2xl border border-c700 p-6 flex flex-col items-center justify-center text-center gap-3">
            <h3 className="text-white font-semibold">Join the Conversation</h3>
            <p className="text-c300 text-sm">Sign in to ask questions anonymously or share your experience.</p>
            <a href="/sign-in" className="px-4.5 py-2 rounded-xl bg-teal text-[#06251D] text-[14px] font-bold hover:brightness-105 transition-all inline-block mt-2">Sign In</a>
          </div>
        )}

        {/* Thread List */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="text-c400 text-center py-8">Loading feed...</div>
          ) : threads.length > 0 ? (
            threads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          ) : (
            <div className="text-c400 text-center py-8">No posts found in this view.</div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block">
        <FeedSidebarRight />
      </div>
    </div>
  );
}
