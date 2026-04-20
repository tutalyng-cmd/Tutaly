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
  FileText
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

  const employerLinks = [
    { name: 'Overview', href: '/employer', icon: Building2 },
    { name: 'My Jobs', href: '/employer/jobs', icon: Briefcase },
    { name: 'Post a Job', href: '/employer/jobs/create', icon: FileText },
    { name: 'Settings', href: '/employer/settings', icon: Settings },
  ];

  const seekerLinks = [
    { name: 'My Profile', href: '/seeker', icon: User },
    { name: 'Applications', href: '/seeker/applications', icon: Briefcase },
    { name: 'Saved Jobs', href: '/seeker/saved', icon: Heart },
    { name: 'Settings', href: '/seeker/settings', icon: Settings },
  ];

  const links = isEmployer ? employerLinks : isSeeker ? seekerLinks : [];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 border-b border-gray-100 mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isEmployer ? 'Employer Workspace' : isSeeker ? 'Professional Profile' : 'Dashboard'}
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
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
