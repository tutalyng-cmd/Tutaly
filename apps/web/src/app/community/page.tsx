'use client';

import React, { useEffect, useState } from 'react';
import { apiAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { FeedList } from '@/components/community/FeedList';
import { PostComposer } from '@/components/community/PostComposer';
import Link from 'next/link';

export default function CommunityPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'following'>('global');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const res = await apiAuth.withToken(token).get('/user/me');
          setCurrentUser(res.data?.data);
        }
      } catch (error) {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-c300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-c800/80 backdrop-blur-sm border border-c700 rounded-xl w-full max-w-sm mb-6 shadow-sm">
        <button 
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'global' ? 'bg-c700 text-c100 shadow-sm ring-1 ring-c600/50' : 'text-c400 hover:text-c200 hover:bg-c700/30'}`}
        >
          Global
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'following' ? 'bg-c700 text-c100 shadow-sm ring-1 ring-c600/50' : 'text-c400 hover:text-c200 hover:bg-c700/30'}`}
        >
          Following
        </button>
      </div>

      {currentUser && (
        <PostComposer currentUser={currentUser} onPostCreated={(post) => {
          window.location.reload();
        }} />
      )}

      <FeedList currentUser={currentUser} feedType={activeTab} />
    </div>
  );
}
