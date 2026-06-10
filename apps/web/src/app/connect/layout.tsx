'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import {
  Home,
  Bell,
  MessageCircle,
  Users,
  Search,
  BookMarked,
  PenSquare,
  UserPlus
} from 'lucide-react';
import SidebarAd from '@/components/ads/SidebarAd';

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const doFetch = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await apiAuth.withToken(token).get('/support/notifications?limit=1');
        if (isMounted) {
          setUnreadCount(res.data?.meta?.unreadCount || 0);
        }
      } catch { /* ignore */ }
    };

    const fetchSuggested = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await apiAuth.withToken(token).get('/connect/discover?limit=3');
        if (isMounted) {
          setSuggestedUsers(res.data?.data || []);
        }
      } catch { /* ignore */ }
    };

    doFetch();
    fetchSuggested();
    const interval = setInterval(doFetch, 30000); // poll every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'Feed', href: '/connect', icon: Home },
    { name: 'Discover', href: '/connect/discover', icon: Search },
    { name: 'Messages', href: '/connect/messages', icon: MessageCircle },
    { name: 'Notifications', href: '/connect/notifications', icon: Bell, badge: unreadCount },
    { name: 'Network', href: '/connect/network', icon: Users },
  ];

  const sidebarLinks = [
    { name: 'My Posts', href: '/connect/my-posts', icon: PenSquare },
    { name: 'Saved Posts', href: '/connect/saved', icon: BookMarked },
  ];

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gray-50">
      {/* Desktop Top Bar */}
      <div className="hidden lg:block border-b border-gray-200 bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 h-12">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                  {item.badge ? (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content (3-column layout) */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20 lg:pb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Shortcuts</h3>
            <div className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2">
          {children}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          {suggestedUsers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">People You May Know</h3>
              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 px-1">
                    <Link href={`/connect/profile/${user.username || user.id}`} className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                        ) : (
                          (user.firstName || user.email || 'U')[0].toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/connect/profile/${user.username || user.id}`} className="block">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">@{user.username || user.email.split('@')[0]}</p>
                      </Link>
                    </div>
                    <button className="text-teal-600 hover:bg-teal-50 p-1.5 rounded-lg transition-colors" title="Follow">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Link href="/connect/discover" className="block mt-4 text-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                View more
              </Link>
            </div>
          )}
          
          <SidebarAd placement="connect_sidebar" />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                {item.badge ? (
                  <span className="absolute -top-1 right-0 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
