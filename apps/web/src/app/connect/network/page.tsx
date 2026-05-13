'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { Users, UserCheck, UserX, UserPlus, Clock, ChevronDown } from 'lucide-react';

interface FollowData {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface PendingRequest {
  id: string;
  follower: FollowData;
  createdAt: string;
}

type Tab = 'followers' | 'following' | 'pending';

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<Tab>('followers');
  const [followers, setFollowers] = useState<FollowData[]>([]);
  const [following, setFollowing] = useState<FollowData[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ followers: 0, following: 0, pending: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const [followersRes, followingRes, pendingRes] = await Promise.all([
        apiAuth.withToken(token).get('/connect/followers?limit=50'),
        apiAuth.withToken(token).get('/connect/following?limit=50'),
        apiAuth.withToken(token).get('/connect/follow/pending?limit=50'),
      ]);

      setFollowers(followersRes.data?.data || []);
      setFollowing(followingRes.data?.data || []);
      setPending(pendingRes.data?.data || []);
      setCounts({
        followers: followersRes.data?.meta?.total || 0,
        following: followingRes.data?.meta?.total || 0,
        pending: pendingRes.data?.meta?.total || 0,
      });
    } catch (err) {
      console.error('Failed to load network', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAccept = async (followerId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch(`/connect/follow/${followerId}/accept`);
      fetchData();
    } catch (err) {
      console.error('Failed to accept follow', err);
    }
  };

  const handleReject = async (followerId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch(`/connect/follow/${followerId}/reject`);
      fetchData();
    } catch (err) {
      console.error('Failed to reject follow', err);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/connect/follow/${userId}`);
      fetchData();
    } catch (err) {
      console.error('Failed to unfollow', err);
    }
  };

  const getName = (p: FollowData) => {
    if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
    return p.email?.split('@')[0] || 'User';
  };

  const getInitial = (p: FollowData) => getName(p).charAt(0).toUpperCase();

  const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { key: 'followers', label: 'Followers', count: counts.followers, icon: Users },
    { key: 'following', label: 'Following', count: counts.following, icon: UserCheck },
    { key: 'pending', label: 'Requests', count: counts.pending, icon: Clock },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Network</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your professional connections</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`bg-white rounded-2xl border p-4 text-center transition-all ${
              activeTab === tab.key
                ? 'border-teal-300 shadow-md ring-1 ring-teal-100'
                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
            }`}
          >
            <tab.icon className={`w-5 h-5 mx-auto mb-2 ${activeTab === tab.key ? 'text-teal-600' : 'text-gray-400'}`} />
            <p className={`text-2xl font-bold ${activeTab === tab.key ? 'text-teal-700' : 'text-gray-900'}`}>
              {tab.count}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{tab.label}</p>
            {tab.key === 'pending' && tab.count > 0 && (
              <span className="inline-block mt-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tab.count} new
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Pending Requests */}
          {activeTab === 'pending' && (
            pending.length === 0 ? (
              <EmptyState icon={Clock} title="No pending requests" subtitle="When someone requests to follow you, it will appear here." />
            ) : (
              <div className="space-y-3">
                {pending.map((req) => (
                  <div key={req.follower.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-base shrink-0">
                        {getInitial(req.follower)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{getName(req.follower)}</p>
                        <p className="text-xs text-gray-400">Wants to follow you</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(req.follower.id)}
                          className="flex items-center gap-1 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(req.follower.id)}
                          className="text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Followers */}
          {activeTab === 'followers' && (
            followers.length === 0 ? (
              <EmptyState icon={Users} title="No followers yet" subtitle="Share your profile to grow your network." />
            ) : (
              <div className="space-y-3">
                {followers.map((person) => (
                  <PersonCard key={person.id} person={person} getName={getName} getInitial={getInitial} gradient="from-blue-400 to-indigo-500" />
                ))}
              </div>
            )
          )}

          {/* Following */}
          {activeTab === 'following' && (
            following.length === 0 ? (
              <EmptyState icon={UserCheck} title="Not following anyone" subtitle="Discover professionals to follow." />
            ) : (
              <div className="space-y-3">
                {following.map((person) => (
                  <div key={person.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-base shrink-0">
                        {getInitial(person)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{getName(person)}</p>
                      </div>
                      <button
                        onClick={() => handleUnfollow(person.id)}
                        className="text-sm font-medium text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
}

function PersonCard({ person, getName, getInitial, gradient }: {
  person: FollowData;
  getName: (p: FollowData) => string;
  getInitial: (p: FollowData) => string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shrink-0`}>
          {getInitial(person)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{getName(person)}</p>
        </div>
      </div>
    </div>
  );
}
