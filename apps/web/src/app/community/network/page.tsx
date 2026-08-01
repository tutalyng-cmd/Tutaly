'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '@/features/community/api/community.service';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function NetworkPage() {
  const [network, setNetwork] = useState<any>({ followers: [], following: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await communityService.getNetwork();
        setNetwork(data);
      } catch (e) {
        console.error('Failed to load network', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  // Combine them for a single "Connections" list for now, or just show following
  const connections = network.following || [];

  return (
    <div className="max-w-[920px] mx-auto">
      
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-4">Your Connections</div>
        
        {connections.length === 0 ? (
          <div className="text-center py-10 text-c500 text-[14px]">
            You aren't following anyone yet. Head over to <Link href="/community/discover" className="text-teal hover:underline">Discover</Link> to find professionals to connect with.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {connections.map((person: any, i: number) => {
              const name = person.firstName ? `${person.firstName} ${person.lastName}` : person.username;
              const init = (person.firstName?.[0] || name[0]).toUpperCase() + (person.lastName?.[0] || '').toUpperCase();
              
              return (
                <div key={i} className="bg-c700 border border-c600/50 rounded-2xl p-4.5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-c600 border border-c600 flex items-center justify-center font-mono font-semibold text-2xl text-white mb-2 mx-auto">
                    {init}
                  </div>
                  <div className="text-[13.5px] font-bold text-white">{name}</div>
                  <div className="text-[11.5px] text-c400 truncate w-full mt-0.5">Verified Professional</div>
                  <Link href={`/community/messages?to=${person.id}`} className="w-full mt-3 block">
                    <button className="w-full px-4 py-2 rounded-xl border border-c600 bg-transparent text-white text-[13px] font-bold hover:border-teal hover:text-teal transition-colors">
                      Message
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
