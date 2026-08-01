'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '@/features/community/api/community.service';
import { Loader2 } from 'lucide-react';

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
      // Optimistically remove or show 'requested'
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Failed to follow', e);
    }
  };

  return (
    <div className="max-w-[920px] mx-auto flex flex-col gap-4.5">
      
      {/* Communities to Join (Hardcoded for now as it's out of scope of just "people to follow") */}
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-3.5">Communities to join</div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            { icon: '🏦', name: 'Fintech Hiring', meta: '12.4K members' },
            { icon: '🌍', name: 'Remote Work Nigeria', meta: '9.8K members' },
            { icon: '👩🏽‍💻', name: 'Women in Tech', meta: '7.1K members' },
            { icon: '🎨', name: 'Design Systems', meta: '4.6K members' },
            { icon: '📊', name: 'Data & Analytics', meta: '5.3K members' },
            { icon: '🚀', name: 'Startup Founders', meta: '3.9K members' },
          ].map((topic, i) => (
            <div key={i} className="bg-c800 border border-c700 rounded-2xl p-4.5 flex flex-col gap-2.5">
              <div className="w-[38px] h-[38px] rounded-lg bg-c700 border border-c700 flex items-center justify-center text-[17px]">
                {topic.icon}
              </div>
              <div className="font-bold text-[14.5px] text-white">{topic.name}</div>
              <div className="font-mono text-[12px] text-c500">{topic.meta}</div>
              <button className="px-3 py-1.5 mt-0.5 rounded-lg border border-c600 bg-transparent text-white text-xs font-semibold self-start hover:border-teal hover:text-teal transition-colors">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* People to Follow */}
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-3">People to follow</div>
        
        <div className="flex flex-col">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-teal" /></div>
          ) : people.length === 0 ? (
            <div className="text-center py-8 text-[13.5px] text-c500">You've followed everyone we can recommend right now!</div>
          ) : (
            people.map((person) => {
              const name = person.firstName ? `${person.firstName} ${person.lastName}` : person.username;
              const init = (person.firstName?.[0] || name[0]).toUpperCase() + (person.lastName?.[0] || '').toUpperCase();
              
              return (
                <div key={person.id} className="flex items-center gap-2.5 py-2.5 border-b border-c700 last:border-0">
                  <div className="w-[38px] h-[38px] rounded-full bg-c700 border border-c700 shrink-0 flex items-center justify-center font-mono font-semibold text-[12.5px] text-white">
                    {init}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-white truncate">{name}</div>
                    <div className="text-[11.5px] text-c500 truncate">Professional</div>
                  </div>
                  <button 
                    onClick={() => handleFollow(person.id)}
                    className="px-3 py-1.5 rounded-lg border border-c600 bg-transparent text-white text-xs font-semibold shrink-0 hover:border-teal hover:text-teal transition-colors"
                  >
                    Follow
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
