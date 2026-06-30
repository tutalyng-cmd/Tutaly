'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ShoppingCart, Bell, Check } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { apiAuth } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItemCount } = useCart();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    };
    
    const handleLogout = () => setIsAuthenticated(false);
    
    checkAuth();
    window.addEventListener('focus', checkAuth);
    window.addEventListener('auth-logout', handleLogout);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('auth-logout', handleLogout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await apiAuth.withToken(token!).get('/connect/notifications');
          const notifs = res.data?.data || [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
        } catch (err) {}
      };
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token!).patch(`/connect/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const getNotifLink = (type: string, referenceId: string) => {
    switch (type) {
      case 'FOLLOW': return `/connect/profile/${referenceId}`;
      case 'COMMENT':
      case 'LIKE': return `/connect`;
      default: return `/connect`;
    }
  };

  const isActive = (path: string) => pathname?.startsWith(path) ? "active" : "";

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`} aria-label="Main navigation">
      <div className="container">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="Tutaly home">
            <Image src="/logo.png" alt="Tutaly" width={140} height={40} className="h-8 w-auto object-contain" />
          </Link>
          
          <ul className="nav__links" role="list">
            <li><Link href="/jobs" className={isActive("/jobs")}>Jobs</Link></li>
            <li><Link href="/salaries" className={isActive("/salaries")}>Salaries</Link></li>
            <li><Link href="/reviews" className={isActive("/reviews")}>Reviews</Link></li>
            <li><Link href="/shop" className={isActive("/shop")}>Marketplace</Link></li>
            <li><Link href="/connect" className={isActive("/connect")}>Connect</Link></li>
          </ul>

          <div className="nav__actions">
            {/* Cart Icon */}
            <Link href="/shop/cart" className="relative p-2" style={{ color: 'var(--c-200)' }}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2"
                  style={{ color: 'var(--c-200)', background: 'transparent' }}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red border-2 border-c900"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-c800 rounded-lg shadow-lg border border-c700 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-c700 flex justify-between items-center">
                      <h3 className="font-bold text-c100 text-sm">Notifications</h3>
                      {unreadCount > 0 && <span className="text-xs text-blueL bg-blueL/10 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-c400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <Link 
                          key={n.id} 
                          href={getNotifLink(n.type, n.referenceId)}
                          onClick={() => setShowNotifications(false)}
                          className={`block px-4 py-3 hover:bg-c700 transition-colors ${!n.isRead ? 'bg-blueL/5' : ''}`}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-c200">{n.message}</p>
                              <p className="text-xs text-c400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                            {!n.isRead && (
                              <button 
                                onClick={(e) => handleMarkRead(n.id, e)}
                                className="text-blueL hover:bg-c600 p-1.5 rounded-full shrink-0"
                                title="Mark as read"
                                style={{ background: 'transparent' }}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn btn--primary hidden md:inline-flex">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/signin" className="btn btn--ghost hidden md:inline-flex">Sign in</Link>
                <Link href="/employer/jobs/create" className="btn btn--primary hidden md:inline-flex">Get started</Link>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
              style={{ color: 'var(--c-200)', background: 'transparent' }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-c800 border-b border-c700 md:hidden p-4 flex flex-col gap-3 shadow-lg">
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/jobs" className="text-c200 font-medium">Jobs</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/salaries" className="text-c200 font-medium">Salaries</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/reviews" className="text-c200 font-medium">Reviews</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop" className="text-c200 font-medium">Marketplace</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/connect" className="text-c200 font-medium">Connect</Link>
            <div className="border-t border-c700 mt-2 pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard" className="btn btn--primary text-center">Dashboard</Link>
              ) : (
                <>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/auth/signin" className="btn btn--ghost text-center w-full block">Sign in</Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/employer/jobs/create" className="btn btn--primary text-center w-full block">Get started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
