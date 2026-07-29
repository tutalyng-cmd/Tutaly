'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import { UserPlus, UserMinus, MessageCircle, MapPin, Calendar, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { username } = useParams() as { username: string };
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/connect/profiles/${username}`);
      setProfile(res.data);
    } catch (e) {
       
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
      /* eslint-enable @typescript-eslint/no-unused-vars */
       
       
      const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
       
setError(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiAuth.withToken(token).get('/user/me').then(res => {
        setCurrentUserId(res.data?.data?.id || '');
      }).catch(() => {});
    }
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token!).post(`/connect/follow/${profile.id}`);
      alert('Follow request sent');
    } catch (e) {
       
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
      /* eslint-enable @typescript-eslint/no-unused-vars */
       
       
      const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
       
alert(err?.response?.data?.message || 'Failed to follow user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-c800/80 backdrop-blur-sm rounded-2xl border border-c700 h-96 animate-pulse" />
        <div className="bg-c800/80 backdrop-blur-sm rounded-2xl border border-c700 h-32 animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-c100 mb-2">Profile not found</h2>
        <p className="text-c400 mb-6">{error || "The user you are looking for doesn't exist or is private."}</p>
        <Link href="/community" className="text-blue font-semibold hover:underline">Return to Feed</Link>
      </div>
    );
  }

  const isOwner = profile.id === currentUserId;
  const displayName = profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.username || profile.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-c800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-c700 overflow-hidden">
        {/* Cover Photo Placeholder */}
        <div className="h-48 bg-c700 w-full relative">
          {/* We could render cover image here if it was available */}
        </div>
        
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex justify-between items-end mb-4">
            <div className="-mt-16 relative">
              <div className="w-32 h-32 rounded-full border-4 border-c800 bg-c700 shadow-md overflow-hidden flex justify-center items-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-c600 text-c100 flex items-center justify-center text-4xl font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              {!isOwner && (
                <>
                  <button onClick={handleFollow} className="bg-blue text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blueH transition-colors flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Follow
                  </button>
                  <Link href={`/community/messages`} className="bg-c700 border border-c600 text-c100 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-c600 transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-c100">{displayName}</h1>
            <p className="text-c400">@{profile.username || profile.email?.split('@')[0]}</p>
            
            <p className="mt-4 text-c200 leading-relaxed max-w-2xl">
              {profile.bio || 'This user has not set up a bio yet.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-c500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Location Unknown
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-c700">
              <div className="text-center">
                <span className="block text-lg font-bold text-c100">{profile.postsCount || 0}</span>
                <span className="text-sm text-c400">Posts</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold text-c100">{profile.followersCount || 0}</span>
                <span className="text-sm text-c400">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold text-c100">{profile.followingCount || 0}</span>
                <span className="text-sm text-c400">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-c100 px-2">Recent Posts</h3>
        {profile.recentPosts && profile.recentPosts.length > 0 ? (
          profile.recentPosts.map((post: any) => (
            <div key={post.id} className="bg-c800/80 backdrop-blur-sm shadow-sm border border-c700 rounded-2xl p-5">
              <p className="text-c200 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
              {post.imageUrls?.[0] && (
                <div className="rounded-xl overflow-hidden mb-4">
                  <img src={post.imageUrls[0]} alt="Post" className="max-w-full max-h-64 object-contain" />
                </div>
              )}
              <div className="text-xs text-c400">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          ))
        ) : (
          <div className="bg-c800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-c700 p-8 text-center text-c400 text-sm">
            No posts found for this user.
          </div>
        )}
      </div>
    </div>
  );
}
