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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
alert(err?.response?.data?.message || 'Failed to follow user');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green" /></div>;
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-c900 mb-2">Profile not found</h2>
        <p className="text-c500 mb-6">{error || "The user you are looking for doesn't exist or is private."}</p>
        <Link href="/connect" className="text-green font-semibold hover:underline">Return to Feed</Link>
      </div>
    );
  }

  const isOwner = profile.id === currentUserId;
  const displayName = profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.username || profile.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-c100 overflow-hidden">
        {/* Cover Photo Placeholder */}
        <div className="h-48 bg-green w-full relative">
          {/* We could render cover image here if it was available */}
        </div>
        
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex justify-between items-end mb-4">
            <div className="-mt-16 relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex justify-center items-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-green text-white flex items-center justify-center text-4xl font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              {!isOwner && (
                <>
                  <button onClick={handleFollow} className="bg-green text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green transition-colors flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Follow
                  </button>
                  <Link href={`/connect/messages`} className="bg-white border border-c200 text-c700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-c100 transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-c900">{displayName}</h1>
            <p className="text-c500">@{profile.username || profile.email?.split('@')[0]}</p>
            
            <p className="mt-4 text-c800 leading-relaxed max-w-2xl">
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

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-c100">
              <div className="text-center">
                <span className="block text-lg font-bold text-c900">{profile.postsCount || 0}</span>
                <span className="text-sm text-c500">Posts</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold text-c900">{profile.followersCount || 0}</span>
                <span className="text-sm text-c500">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold text-c900">{profile.followingCount || 0}</span>
                <span className="text-sm text-c500">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-c900 px-2">Recent Posts</h3>
        {profile.recentPosts && profile.recentPosts.length > 0 ? (
          profile.recentPosts.map((post: any) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-c100 p-5">
              <p className="text-c800 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
              {post.imageUrls?.[0] && (
                <div className="rounded-xl overflow-hidden mb-4">
                  <img src={post.imageUrls[0]} alt="Post" className="max-w-full max-h-64 object-contain" />
                </div>
              )}
              <div className="text-xs text-c400">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-c100 p-8 text-center text-c500 text-sm">
            No posts found for this user.
          </div>
        )}
      </div>
    </div>
  );
}
