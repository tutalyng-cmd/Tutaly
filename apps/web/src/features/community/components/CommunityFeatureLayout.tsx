'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BowlNavigationSidebar from './BowlNavigationSidebar';
import PostComposerTrigger from './PostComposerTrigger';
import PostComposerModal from './PostComposerModal';
import ThreadCard from './ThreadCard';
import TrendingTopicsWidget from './TrendingTopicsWidget';
import { communityService } from '../api/community.service';
import { CommunityBowl, CommunityThread } from '../types/community.types';
import { api } from '@/lib/api';

export default function CommunityFeatureLayout() {
  const searchParams = useSearchParams();
  const currentBowlSlug = searchParams.get('bowl');

  const [bowls, setBowls] = useState<CommunityBowl[]>([]);
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // User info for composer
  const [userFullName, setUserFullName] = useState<string>('');
  const [userJobTitle, setUserJobTitle] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth and grab profile for default names
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await api.get('/user/profile');
          setUserFullName(`${res.data.data.firstName} ${res.data.data.lastName}`);
          // Simplified fallback for job title
          setUserJobTitle('Verified Professional');
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
      const bowlsRes = await communityService.getTrendingBowls();
      setBowls(bowlsRes.data);

      const threadsRes = await communityService.getFeed({
        bowlSlug: currentBowlSlug || undefined,
        tab: 'global',
        page: 1,
        limit: 20
      });
      setThreads(threadsRes.data);
    } catch (err) {
      console.error('Failed to load community data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBowlSlug]);

  return (
    <div className="page-shell">
      <div className="container py-8">
        
        {/* Header Area */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentBowlSlug ? `#${bowls.find(b => b.slug === currentBowlSlug)?.name || currentBowlSlug}` : 'Professional Community'}
          </h1>
          <p className="text-c300 text-lg">
            {currentBowlSlug 
              ? bowls.find(b => b.slug === currentBowlSlug)?.description || 'Join the discussion.'
              : 'Anonymous workplace discussions, salary insights, and career advice.'}
          </p>
        </div>

        {/* 3-Column Layout */}
        <div className="flex gap-8 items-start">
          
          <BowlNavigationSidebar bowls={bowls} />

          <main className="flex-1 flex flex-col gap-6 min-w-0">
            {isLoggedIn ? (
              <PostComposerTrigger onClick={() => setIsComposerOpen(true)} />
            ) : (
              <div className="bg-c900 rounded-lg border border-c700 p-6 flex flex-col items-center justify-center text-center gap-3">
                <h3 className="text-white font-semibold">Join the Conversation</h3>
                <p className="text-c300 text-sm">Sign in to ask questions anonymously or share your experience.</p>
                <a href="/sign-in" className="btn btn--primary mt-2">Sign In</a>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue border-t-transparent rounded-full" />
              </div>
            ) : threads.length > 0 ? (
              <div className="flex flex-col gap-4">
                {threads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-c900 rounded-lg border border-c700 text-c400">
                No discussions found here yet. Be the first to post!
              </div>
            )}
          </main>

          <TrendingTopicsWidget />

        </div>
      </div>

      {isComposerOpen && (
        <PostComposerModal
          onClose={() => setIsComposerOpen(false)}
          onSuccess={() => {
            loadData();
          }}
          bowls={bowls}
          defaultBowlSlug={currentBowlSlug}
          userFullName={userFullName}
          userJobTitle={userJobTitle}
        />
      )}
    </div>
  );
}
