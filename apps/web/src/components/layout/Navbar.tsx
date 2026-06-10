'use client';

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ShoppingCart, Bell, Check } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { apiAuth } from "@/lib/api";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    
    checkAuth();
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
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
      case 'LIKE': return `/connect`; // Or directly to post if we had a single post page
      default: return `/connect`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
            TUTALY
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center space-x-8 md:flex">
          <Link href="/jobs" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Jobs
          </Link>
          <Link href="/reviews" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Reviews
          </Link>
          <Link href="/salaries" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Salaries
          </Link>
          <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Shop
          </Link>
          <Link href="/connect" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Community
          </Link>
        </div>

        {/* CTAs */}
        <div className="flex items-center space-x-4">
          <Link href="/shop/cart" className="p-2 text-gray-600 hover:text-teal-600 transition-colors relative">
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-teal-600 transition-colors relative"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <Link 
                        key={n.id} 
                        href={getNotifLink(n.type, n.referenceId)}
                        onClick={() => setShowNotifications(false)}
                        className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-teal-50/30' : ''}`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                          {!n.isRead && (
                            <button 
                              onClick={(e) => handleMarkRead(n.id, e)}
                              className="text-teal-600 hover:bg-teal-100 p-1.5 rounded-full shrink-0"
                              title="Mark as read"
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

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden sm:block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-opacity-90 active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-primary">
                Sign In
              </Link>
              <Link
                href="/employer/jobs/create"
                className="hidden sm:block rounded-full bg-accent-teal px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-opacity-90 active:scale-95"
              >
                Post a Job
              </Link>
            </>
          )}

          {/* Hamburger Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/jobs" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-accent-teal">Jobs</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/reviews" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-accent-teal">Reviews</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/salaries" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-accent-teal">Salaries</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-accent-teal">Shop</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop/cart" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">Cart ({cartItemCount})</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/connect" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-accent-teal">Community</Link>
            
            <div className="mt-4 border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard" className="block w-full rounded-md bg-primary px-3 py-2 text-center text-base font-medium text-white shadow-sm">Dashboard</Link>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/auth/signin" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-base font-medium text-gray-700 shadow-sm">Sign In</Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/employer/jobs/create" className="block w-full rounded-md bg-accent-teal px-3 py-2 text-center text-base font-medium text-white shadow-sm">Post a Job</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
