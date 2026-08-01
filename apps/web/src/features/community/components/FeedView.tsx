'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FeedSidebarLeft from './FeedSidebarLeft';
import FeedSidebarRight from './FeedSidebarRight';
import ThreadCard from './ThreadCard';
import { communityService } from '../api/community.service';
import { CommunityThread, CommunityBowl } from '../types/community.types';
import { api } from '@/lib/api';
import { ImageIcon, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import PostComposerModal from './PostComposerModal';

export default function FeedView() {
  const searchParams = useSearchParams();
  const currentBowlSlug = searchParams.get('bowl');

  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'following'>('global');

  // User info for composer
  const [userInitials, setUserInitials] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [userJobTitle, setUserJobTitle] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Composer
  const [showComposer, setShowComposer] = useState(false);
  const [bowls, setBowls] = useState<CommunityBowl[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await api.get('/user/me');
          const data = res.data?.data || {};
          const first = data.firstName || '';
          const last = data.lastName || '';
          setUserInitials((first.charAt(0) + last.charAt(0)).toUpperCase() || 'U');
          setUserFullName(`${first} ${last}`.trim());
          setUserJobTitle(data.seekerProfile?.headline || data.companyName || 'Member');
        } catch (err) {
          console.error('[FeedView] User fetch error:', err);
        }
      }
    };
    fetchUser();
    
    // Fetch bowls for composer
    const fetchBowls = async () => {
      try {
        const b = await communityService.getTrendingBowls();
        setBowls(b?.data || b || []);
      } catch (err) {
        console.error('[FeedView] Bowls fetch error:', err);
      }
    };
    fetchBowls();
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
      setThreads(threadsRes.data || []);
    } catch (err) {
      console.error('[FeedView] Feed fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBowlSlug, activeTab]);

  return (
    <main className="layout">
      {/* Left Sidebar */}
      <FeedSidebarLeft />

      {/* Center Feed */}
      <div className="col center">
        {/* Global/Following Segmented Control */}
        <div className="segmented">
          <button
            onClick={() => setActiveTab('global')}
            className={activeTab === 'global' ? 'active' : ''}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={activeTab === 'following' ? 'active' : ''}
          >
            Following
          </button>
        </div>

        {/* Composer */}
        {isLoggedIn ? (
          <div className="card composer" onClick={() => setShowComposer(true)} style={{ cursor: 'pointer' }}>
            <div className="composer-top pointer-events-none">
              <div className="mini-avatar">{userInitials}</div>
              <div className="composer-input">
                <textarea rows={1} placeholder="Share thoughts, ask a question, or post an update…" readOnly></textarea>
              </div>
            </div>
            <div className="composer-tools pointer-events-none">
              <div className="tool-icons">
                <button className="tool-chip"><ImageIcon size={14} /> Photo</button>
                <button className="tool-chip salary"><DollarSign size={14} /> Salary tag</button>
                <button className="tool-chip"><BarChart3 size={14} /> Poll</button>
              </div>
              <button className="btn-solid">Post</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <h3 style={{ marginBottom: '10px' }}>Join the Conversation</h3>
            <p style={{ color: 'var(--text-400)', fontSize: '14px', marginBottom: '20px' }}>Sign in to ask questions anonymously or share your experience.</p>
            <a href="/auth/signin" className="btn-solid" style={{ display: 'inline-block' }}>Sign In</a>
          </div>
        )}

        {/* Thread List */}
        {isLoading ? (
          <div className="comm-loading">
            <Loader2 size={24} />
          </div>
        ) : threads.length > 0 ? (
          threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))
        ) : (
          <div className="comm-empty">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <FeedSidebarRight />

      {showComposer && (
        <PostComposerModal
          onClose={() => setShowComposer(false)}
          onSuccess={() => {
            setShowComposer(false);
            loadData();
          }}
          bowls={bowls}
          defaultBowlSlug={currentBowlSlug || undefined}
          userFullName={userFullName}
          userJobTitle={userJobTitle}
        />
      )}
    </main>
  );
}
