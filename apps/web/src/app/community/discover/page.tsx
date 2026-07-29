'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PersonData {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  createdAt: string;
  avatar?: string;
  username?: string;
}

export default function DiscoverPage() {
  const [people, setPeople] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPeople = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/connect/discover?page=${page}&limit=20`);
      setPeople(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load discover', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchPeople(); }, [fetchPeople]);

  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/connect/follow/${userId}`);
      setFollowing(prev => new Set(prev).add(userId));
    } catch (err) {
      console.error('Failed to follow', err);
    }
  };

  const getName = (p: PersonData) => {
    if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
    return p.username || p.email?.split('@')[0] || 'User';
  };

  const getInitial = (p: PersonData) => getName(p).charAt(0).toUpperCase();

  const gradients = [
    'bg-green',
    'bg-blue shadow-glow-blue',
    'from-purple-400 to-pink-500',
    'from-orange-400 to-red',
    'from-cyan-400 to-blue',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-c100">Discover People</h1>
        <p className="text-c400 text-sm mt-1">Find professionals to grow your network</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-c800/80 backdrop-blur-sm rounded-2xl border border-c700 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-c700 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-c700 rounded w-2/3" />
                  <div className="h-3 bg-c600 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="bg-c800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-c700 p-12 text-center">
          <div className="w-16 h-16 bg-c700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-c400" />
          </div>
          <h3 className="text-lg font-bold text-c100 mb-2">No one to discover</h3>
          <p className="text-c400 text-sm">You&apos;re already following everyone! Check back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {people.map((person, idx) => {
              const profileLink = `/community/profile/${person.username || person.id}`;
              return (
                <div
                  key={person.id}
                  className="bg-c800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-c700 p-5 hover:shadow-md hover:border-blue transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Link href={profileLink} className="shrink-0">
                      <div className={`w-14 h-14 rounded-full ${gradients[idx % gradients.length]} flex items-center justify-center text-white font-bold text-lg shrink-0 group-hover:scale-105 transition-transform overflow-hidden`}>
                        {person.avatar ? (
                          <img src={person.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          getInitial(person)
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={profileLink} className="block hover:underline">
                        <p className="text-sm font-bold text-c100 truncate">{getName(person)}</p>
                      </Link>
                      <p className="text-xs text-c400 capitalize">{person.role}</p>
                    </div>
                    {following.has(person.id) ? (
                      <span className="text-xs font-bold text-c100 bg-c700 px-3 py-1.5 rounded-full">
                        Requested
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFollow(person.id)}
                        className="flex items-center gap-1.5 text-sm font-bold text-white bg-blue hover:bg-blueH px-3 py-1.5 rounded-pill transition-colors shadow-glow-blue active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Follow
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-bold text-c100 bg-c800/80 backdrop-blur-sm border border-c700 rounded-xl hover:bg-c700 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={people.length < 20}
                className="px-4 py-2 text-sm font-bold text-white bg-blue rounded-xl hover:bg-blueH shadow-glow-blue disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
