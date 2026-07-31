'use client';

import React from 'react';
import Link from 'next/link';
import { Hash } from 'lucide-react';
import { CommunityBowl } from '../types/community.types';
import { usePathname, useSearchParams } from 'next/navigation';

export default function BowlNavigationSidebar({ bowls }: { bowls: CommunityBowl[] }) {
  const searchParams = useSearchParams();
  const currentBowl = searchParams.get('bowl');

  return (
    <aside className="w-[240px] flex-shrink-0 hidden md:flex flex-col gap-6">
      <div className="bg-c900 rounded-lg border border-c700 p-4">
        <h3 className="text-sm font-semibold text-c300 uppercase tracking-wider mb-4">Discover Bowls</h3>
        
        <nav className="flex flex-col gap-1">
          <Link
            href="/community"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              !currentBowl ? 'bg-c800 text-white' : 'text-c300 hover:bg-c800 hover:text-white'
            }`}
          >
            <span className="font-medium">All Topics</span>
          </Link>

          {bowls.map((bowl) => (
            <Link
              key={bowl.id}
              href={`/community?bowl=${bowl.slug}`}
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                currentBowl === bowl.slug ? 'bg-c800 text-white' : 'text-c300 hover:bg-c800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Hash className="w-4 h-4 opacity-50" />
                <span className="font-medium truncate">{bowl.name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="text-xs text-c400 px-4">
        <p>Bowls are dedicated spaces for industry, company, and topic-based discussions.</p>
      </div>
    </aside>
  );
}
