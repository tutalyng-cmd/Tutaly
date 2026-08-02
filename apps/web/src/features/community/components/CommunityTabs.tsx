'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, Bell, Users } from 'lucide-react';

export default function CommunityTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Feed', href: '/community', icon: Home, isExact: true },
    { label: 'Notifications', href: '/community/notifications', icon: Bell, hasDot: true },
    { label: 'Network', href: '/community/network', icon: Users },
  ];

  return (
    <nav className="community-tabs">
      {tabs.map((tab) => {
        const isActive = tab.isExact ? pathname === tab.href : pathname?.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={isActive ? 'active' : ''}
          >
            <span className="ic"><Icon size={16} /></span>
            {tab.label}
            {tab.hasDot && <span className="ct-dot" />}
          </Link>
        );
      })}
    </nav>
  );
}
