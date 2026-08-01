'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '@/features/community/api/community.service';
import { Building2, Globe, Code, Palette, BarChart3, Rocket, Loader2 } from 'lucide-react';

const TOPIC_ICONS: Record<string, React.ElementType> = {
  'Fintech Hiring': Building2,
  'Remote Work Nigeria': Globe,
  'Women in Tech': Code,
  'Design Systems': Palette,
  'Data & Analytics': BarChart3,
  'Startup Founders': Rocket,
};

export default function DiscoverPage() {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await communityService.getDiscoverPeople();
        if (res.data) setPeople(res.data);
      } catch (e) {
        console.error('Failed to load discover people', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFollow = async (id: string) => {
    try {
      await communityService.followUser(id);
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Failed to follow', e);
    }
  };

  // Communities from API when available — for now we show the section
  // only when API endpoints exist. The structure matches commtest exactly.
  const communities = [
    { name: 'Fintech Hiring', members: '12.4K members' },
    { name: 'Remote Work Nigeria', members: '9.8K members' },
    { name: 'Women in Tech', members: '7.1K members' },
    { name: 'Design Systems', members: '4.6K members' },
    { name: 'Data & Analytics', members: '5.3K members' },
    { name: 'Startup Founders', members: '3.9K members' },
  ];

  return (
    <main className="layout one-col">
      <div className="col center">
        {/* Communities to Join */}
        <div className="card">
          <div className="card-title">Communities to join</div>
          <div className="topic-grid">
            {communities.map((topic) => {
              const Icon = TOPIC_ICONS[topic.name] || Building2;
              return (
                <div key={topic.name} className="card topic-card">
                  <div className="topic-icon"><Icon size={18} /></div>
                  <div className="topic-name">{topic.name}</div>
                  <div className="topic-meta">{topic.members}</div>
                  <button className="follow-btn">Join</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* People to Follow */}
        <div className="card">
          <div className="card-title">People to follow</div>

          {loading ? (
            <div className="comm-loading">
              <Loader2 size={20} />
            </div>
          ) : people.length === 0 ? (
            <div className="comm-empty">
              You&apos;ve followed everyone we can recommend right now!
            </div>
          ) : (
            people.map((person) => {
              const first = person.firstName || person.seekerProfile?.firstName || 'User';
              const last = person.lastName || person.seekerProfile?.lastName || '';
              const initials = `${first.charAt(0)}${(last.charAt(0) || '')}`.toUpperCase();
              const headline = person.seekerProfile?.headline || person.headline || 'Tutaly Member';

              return (
                <div key={person.id} className="suggest-row">
                  <div className="suggest-avatar">{initials}</div>
                  <div className="suggest-info">
                    <div className="suggest-name">{first} {last}</div>
                    <div className="suggest-role">{headline}</div>
                  </div>
                  <button className="follow-btn" onClick={() => handleFollow(person.id)}>Follow</button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
