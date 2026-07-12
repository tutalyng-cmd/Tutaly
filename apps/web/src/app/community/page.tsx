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
          const res = await apiAuth.withToken(token).get('/auth/me');
          setCurrentUser(res.data.data);
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
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
         <button 
            onClick={() => setActiveTab('global')}
            className={`rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'global' ? 'bg-navy text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            Global
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'following' ? 'bg-navy text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            Following
          </button>
      </div>

      {currentUser ? (
        <PostComposer currentUser={currentUser} onPostCreated={(post) => {
          // Simply reload to fetch the latest feed easily
          window.location.reload();
        }} />
      ) : (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm border border-gray-100">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Join the Conversation</h3>
          <p className="mb-4 text-sm text-gray-500">Sign in to share your thoughts, photos, and connect with other professionals.</p>
          <Link href="/auth/sign-in" className="inline-block rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700 transition-colors">
            Sign In
          </Link>
        </div>
      )}

      <FeedList currentUser={currentUser} feedType={activeTab} />
    </div>
  );
}
