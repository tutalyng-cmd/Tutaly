'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  Briefcase, 
  Settings, 
  LogOut,
  User,
  Heart,
  FileText,
  ShoppingBag,
  Store,
  Package
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Exclude the root redirect page from sidebar wrapper
  if (pathname === '/dashboard') {
    return <main>{children}</main>;
  }

  const isEmployer = pathname.startsWith('/employer');
  const isSeeker = pathname.startsWith('/seeker');
  const isSeller = pathname.startsWith('/seller');

  const employerLinks = [
    { name: 'Overview', href: '/employer', icon: Building2 },
    { name: 'My Jobs', href: '/employer/jobs', icon: Briefcase },
    { name: 'Post a Job', href: '/employer/jobs/create', icon: FileText },
    { name: 'Seller Dashboard', href: '/seller', icon: Store },
    { name: 'Settings', href: '/employer/settings', icon: Settings },
  ];

  const seekerLinks = [
    { name: 'My Profile', href: '/seeker', icon: User },
    { name: 'Applications', href: '/seeker/applications', icon: Briefcase },
    { name: 'Saved Jobs', href: '/seeker/saved', icon: Heart },
    { name: 'My Orders', href: '/seeker/orders', icon: ShoppingBag },
    { name: 'Seller Dashboard', href: '/seller', icon: Store },
    { name: 'Settings', href: '/seeker/settings', icon: Settings },
  ];

  const sellerLinks = [
    { name: 'Dashboard', href: '/seller', icon: Store },
    { name: 'Add Product', href: '/seller/create', icon: FileText },
  ];

  const isAdmin = pathname.startsWith('/admin');
  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: Building2 },
    { name: 'Approve Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Approve Sellers', href: '/admin/sellers', icon: Store },
    { name: 'Marketplace Catalog', href: '/admin/products', icon: Package },
    { name: 'Shop Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Manage Users', href: '/admin/users', icon: User },
  ];

  const links = isSeller ? sellerLinks : isEmployer ? employerLinks : isSeeker ? seekerLinks : isAdmin ? adminLinks : [];

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
      }
    } catch {
      // Even if backend call fails, clear local state
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] overflow-hidden bg-gray-50 relative">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 border-b border-gray-100 mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isSeller ? 'Seller Dashboard' : isEmployer ? 'Employer Workspace' : isSeeker ? 'Professional Profile' : isAdmin ? 'Admin Control Panel' : 'Dashboard'}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 mt-2">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    isActive ? 'text-teal-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut
              className="mr-3 h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-500"
              aria-hidden="true"
            />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pb-16 lg:pb-0">
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex overflow-x-auto justify-start items-center h-16 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[72px] shrink-0 px-1 space-y-1 transition-colors ${
                  isActive ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-teal-700' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center min-w-[72px] shrink-0 px-1 space-y-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium whitespace-nowrap">Sign out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
