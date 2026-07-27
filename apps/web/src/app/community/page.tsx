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
      <div className="app-tabs mb-4">
        <button 
          onClick={() => setActiveTab('global')}
          className={`app-tab ${activeTab === 'global' ? 'active' : ''}`}
        >
          Global
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          className={`app-tab ${activeTab === 'following' ? 'active' : ''}`}
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
