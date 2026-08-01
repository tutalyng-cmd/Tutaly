'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '@/features/community/api/community.service';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function NetworkPage() {
  const [network, setNetwork] = useState<any>({ followers: [], following: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connections' | 'invitations' | 'suggested'>('connections');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await communityService.getNetwork();
        setNetwork(data);
      } catch (e) {
        console.error('Failed to load network', e);
      }

      try {
        const res = await communityService.getDiscoverPeople();
        if (res.data) setSuggestions(res.data);
      } catch (e) {
        console.error('Failed to load suggestions', e);
      }

      setLoading(false);
    }
    load();
  }, []);

  const handleFollow = async (userId: string) => {
    try {
      await communityService.followUser(userId);
      setSuggestions((prev) => prev.filter(p => p.id !== userId));
    } catch (e) {
      console.error('Follow failed', e);
    }
  };

  if (loading) {
    return (
      <main className="layout one-col">
        <div className="col center">
          <div className="comm-loading"><Loader2 size={24} /></div>
        </div>
      </main>
    );
  }

  const connections = network.following || [];

  const getInitials = (person: any) => {
    const first = person.firstName || person.username || 'U';
    const last = person.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const getName = (person: any) => {
    return person.firstName ? `${person.firstName} ${person.lastName || ''}`.trim() : person.username;
  };

  const getHeadline = (person: any) => {
    return person.seekerProfile?.headline || person.headline || 'Professional';
  };

  return (
    <main className="layout one-col">
      <div className="col center">
        {/* Segmented Control */}
        <div className="segmented">
          <button
            className={activeTab === 'connections' ? 'active' : ''}
            onClick={() => setActiveTab('connections')}
          >
            Connections · {connections.length}
          </button>
          <button
            className={activeTab === 'invitations' ? 'active' : ''}
            onClick={() => setActiveTab('invitations')}
          >
            Invitations
          </button>
          <button
            className={activeTab === 'suggested' ? 'active' : ''}
            onClick={() => setActiveTab('suggested')}
          >
            Suggested
          </button>
        </div>

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="card">
            {connections.length === 0 ? (
              <div className="comm-empty">
                You aren&apos;t following anyone yet. Head over to{' '}
                <Link href="/community/discover" style={{ color: 'var(--teal)' }}>Discover</Link>{' '}
                to find professionals to connect with.
              </div>
            ) : (
              <div className="net-grid">
                {connections.map((person: any, i: number) => (
                  <div key={i} className="net-card">
                    <div className="net-avatar">{getInitials(person)}</div>
                    <div className="net-name">{getName(person)}</div>
                    <div className="net-role">{getHeadline(person)}</div>
                    <div className="net-actions">
                      <Link href={`/community/messages?to=${person.id}`} style={{ flex: 1 }}>
                        <button className="connect" style={{ width: '100%' }}>Message</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="card">
            <div className="comm-empty">No pending invitations.</div>
          </div>
        )}

        {/* Suggested Tab */}
        {activeTab === 'suggested' && (
          <div className="card">
            {suggestions.length === 0 ? (
              <div className="comm-empty">No suggestions right now.</div>
            ) : (
              <div className="net-grid">
                {suggestions.map((person: any) => (
                  <div key={person.id} className="net-card">
                    <div className="net-avatar">{getInitials(person)}</div>
                    <div className="net-name">{getName(person)}</div>
                    <div className="net-role">{getHeadline(person)}</div>
                    <div className="net-actions">
                      <button className="connect" onClick={() => handleFollow(person.id)}>Connect</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
