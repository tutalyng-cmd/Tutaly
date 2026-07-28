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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setIsLoadingUser(false);
          return;
        }
        const res = await apiAuth.withToken(token).get('/user/me');
        if (isMounted) {
          setCurrentUser(res.data?.data);
        }
      } catch { /* ignore */ } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };

    doFetch();
    fetchSuggested();
    fetchUser();
    const interval = setInterval(doFetch, 30000); // poll every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'Feed', href: '/community', icon: Home },
    { name: 'Discover', href: '/community/discover', icon: Search },
    { name: 'Messages', href: '/community/messages', icon: MessageCircle },
    { name: 'Notifications', href: '/community/notifications', icon: Bell, badge: unreadCount },
    { name: 'Network', href: '/community/network', icon: Users },
  ];

  const getInitials = (user: any) => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    return (user.firstName || user.username || user.email || 'U')[0].toUpperCase();
  };

  const getAuthorName = (author: any) => {
    if (!author) return 'Loading...';
    if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
    if (author.firstName) return author.firstName;
    return author.username || author.email?.split('@')[0] || 'User';
  };

  return (
    <div className="page-shell pt-16">
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Connect</div>
          <h1 className="page-header__title">Build your professional network.</h1>
          <p className="page-header__sub">Follow industry leaders, join communities, and stay visible to the people who matter.</p>
        </div>
      </header>

      <div className="container">
        <div className="feed-layout">
          
          {/* LEFT: PROFILE */}
          <aside aria-label="Your profile" className="hidden lg:block">
            {!currentUser && !isLoadingUser ? (
              <div className="profile-card text-center">
                <h3 className="font-bold text-c100 mb-2">Join Tutaly</h3>
                <p className="text-xs text-c400 mb-4">Connect with professionals and discover opportunities.</p>
                <Link href="/auth/signin" className="btn btn--primary btn--sm w-full block text-center">Sign In</Link>
              </div>
            ) : (
              <div className="profile-card">
                {currentUser?.avatar ? (
                  <div className="profile-card__avatar" style={{ background: 'transparent' }}>
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  </div>
                ) : (
                  <div className="profile-card__avatar">{isLoadingUser ? '?' : getInitials(currentUser)}</div>
                )}
                <div className="profile-card__name">{getAuthorName(currentUser)}</div>
                <div className="profile-card__title">{currentUser?.title || 'Professional · Tutaly Member'}</div>
                <div className="profile-card__stats">
                  <div className="profile-card__stat">
                    <div className="profile-card__stat-num">0</div>
                    <div className="profile-card__stat-label">Connections</div>
                  </div>
                  <div className="profile-card__stat">
                    <div className="profile-card__stat-num">0</div>
                    <div className="profile-card__stat-label">Posts</div>
                  </div>
                </div>
              </div>
            )}

            {currentUser && (
              <div className="suggest-card" style={{ marginTop: '16px' }}>
                <div className="suggest-card__title">Shortcuts</div>
                <Link href="/community/my-posts" className="suggest-row block hover:bg-c700 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <PenSquare className="w-4 h-4 text-c400" />
                    <span className="text-sm font-medium text-c200">My Posts</span>
                  </div>
                </Link>
                <Link href="/community/saved" className="suggest-row block hover:bg-c700 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-c400" />
                    <span className="text-sm font-medium text-c200">Saved Posts</span>
                  </div>
                </Link>
              </div>
            )}
          </aside>

          {/* CENTER: FEED */}
          <main aria-label="Activity feed">
            {children}
          </main>

          {/* RIGHT: SUGGESTIONS */}
          <aside aria-label="Suggested connections" className="hidden lg:block">
            {suggestedUsers.length > 0 && (
              <div className="suggest-card">
                <div className="suggest-card__title">People to follow</div>
                {suggestedUsers.map(user => (
                  <div key={user.id} className="suggest-row">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="suggest-avatar object-cover" />
                    ) : (
                      <div className="suggest-avatar" style={{ background: 'var(--blue)' }}>{getInitials(user)}</div>
                    )}
                    <div className="suggest-info">
                      <div className="suggest-name">
                        <Link href={`/community/profile/${user.username || user.id}`}>{getAuthorName(user)}</Link>
                      </div>
                      <div className="suggest-role">{user.title || 'Professional'}</div>
                    </div>
                    <span className="suggest-follow">Follow</span>
                  </div>
                ))}
              </div>
            )}

            <div className="suggest-card">
              <div className="suggest-card__title">Trending topics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="/community/discover?q=RemoteWork" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#RemoteWork</a>
                <a href="/community/discover?q=SalaryTransparency" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#SalaryTransparency</a>
                <a href="/community/discover?q=FintechHiring" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#FintechHiring</a>
                <a href="/community/discover?q=CareerGrowth" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#CareerGrowth</a>
              </div>
            </div>

            <div className="mt-4">
              <SidebarAd placement="community_sidebar" />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-c800 border-t border-c700 z-50 shadow-lg pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-blue-l' : 'text-c400 hover:text-c100'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                {item.badge ? (
                  <span className="absolute -top-1 right-0 bg-red text-white text-xs font-bold px-1 py-0.5 rounded-full min-w-4 text-center leading-none">
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
