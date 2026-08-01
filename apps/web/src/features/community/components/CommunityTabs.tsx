'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CommunityTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Feed', href: '/community', icon: '🏠', isExact: true },
    { label: 'Discover', href: '/community/discover', icon: '🔍' },
    { label: 'Messages', href: '/community/messages', icon: '💬' },
    { label: 'Notifications', href: '/community/notifications', icon: '🔔', hasDot: true },
    { label: 'Network', href: '/community/network', icon: '🤝' },
  ];

  return (
    <>
      {/* Desktop Tabs */}
      <nav className="max-w-[1360px] mx-auto px-4 sm:px-8 pb-5 hidden sm:flex gap-1.5">
        {tabs.map((tab) => {
          const isActive = tab.isExact ? pathname === tab.href : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-[13.5px] transition-colors
                ${isActive 
                  ? 'bg-teal/10 border-teal text-teal' 
                  : 'bg-c900 border-c700 text-c400 hover:text-white hover:border-c600'
                }
              `}
            >
              <span className="text-[15px]">{tab.icon}</span>
              {tab.label}
              {tab.hasDot && (
                <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red" />
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#151A20]/95 backdrop-blur-md border-t border-c700 p-2.5 pb-3.5 flex justify-around sm:hidden">
        {tabs.map((tab) => {
          const isActive = tab.isExact ? pathname === tab.href : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                relative flex flex-col items-center gap-1 font-semibold text-[10.5px]
                ${isActive ? 'text-teal' : 'text-c500'}
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
              {tab.hasDot && (
                <span className="absolute -top-0.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red border-2 border-c900" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
