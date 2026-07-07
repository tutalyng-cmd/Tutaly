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
  Package,
  AlertTriangle,
  MessageSquare,
  Bell,
  HelpCircle,
  Menu,
  X,
  LayoutDashboard,
  Megaphone,
  CreditCard,
  Users2,
} from 'lucide-react';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  if (pathname === '/dashboard') {
    return <main>{children}</main>;
  }

  const isEmployer = pathname.startsWith('/employer');
  const isSeeker = pathname.startsWith('/seeker');
  const isSeller = pathname.startsWith('/seller');
  const isAdmin = pathname.startsWith('/admin');

  // We can group links if needed, but for now we'll support both flat and grouped structures.
  const employerLinks = [
    {
      label: 'Workspace',
      items: [
        { name: 'Overview', href: '/employer', icon: LayoutDashboard },
        { name: 'Job Postings', href: '/employer/jobs', icon: Briefcase },
        { name: 'Applicants', href: '/employer/applicants', icon: Users2 },
        { name: 'Ad Campaigns', href: '/employer/ads', icon: Megaphone },
      ]
    },
    {
      label: 'Company',
      items: [
        { name: 'Company Profile', href: '/employer/profile', icon: Building2 },
        { name: 'Billing & Plan', href: '/employer/billing', icon: CreditCard },
        { name: 'Settings', href: '/employer/settings', icon: Settings },
      ]
    }
  ];

  const seekerLinks = [
    {
      label: 'Platform',
      items: [
        { name: 'Overview', href: '/seeker', icon: Building2 },
        { name: 'Applications', href: '/seeker/applications', icon: Briefcase },
        { name: 'Saved Jobs', href: '/seeker/saved', icon: Heart },
      ]
    },
    {
      label: 'Shop',
      items: [
        { name: 'My Orders', href: '/seeker/orders', icon: ShoppingBag },
        { name: 'Seller Dashboard', href: '/seller', icon: Store },
      ]
    },
    {
      label: 'Account',
      items: [
        { name: 'Profile', href: '/seeker/profile', icon: User },
        { name: 'Settings', href: '/seeker/settings', icon: Settings },
      ]
    }
  ];

  const sellerLinks = [
    { name: 'Dashboard', href: '/seller', icon: Store },
    { name: 'Add Product', href: '/seller/create', icon: FileText },
  ];

  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: Building2 },
    { name: 'Approve Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Approve Sellers', href: '/admin/sellers', icon: Store },
    { name: 'Shop Catalog', href: '/admin/products', icon: Package },
    { name: 'Shop Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    { name: 'Company Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Manage Users', href: '/admin/users', icon: User },
  ];

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
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  };

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`dash-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon className="w-4 h-4" />
          {item.name}
        </Link>
      );
    });
  };

  const getPageTitle = () => {
    // Find active link name for title
    let title = 'Dashboard';
    const findTitle = (items: any[]) => {
      for (const item of items) {
        if (item.items) {
          findTitle(item.items);
        } else if (item.href === pathname) {
          title = item.name;
        }
      }
    };
    if (isSeeker) findTitle(seekerLinks);
    else if (isEmployer) findTitle(employerLinks);
    else if (isSeller) findTitle(sellerLinks);
    else if (isAdmin) findTitle(adminLinks);
    return title;
  };

  const title = getPageTitle();

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className="dash-sidebar" aria-label="Dashboard navigation">
        <div className="dash-sidebar__logo">
          <Link href="/">
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--c-100)', letterSpacing: '-0.02em' }}>
              Tutaly<span style={{ color: 'var(--blue-l)' }}>.</span>
            </div>
          </Link>
        </div>

        <nav className="dash-sidebar__nav">
          {isSeeker ? (
            seekerLinks.map((group, idx) => (
              <div key={idx} className="dash-nav-group">
                {group.label && <div className="dash-nav-label">{group.label}</div>}
                {renderNavItems(group.items)}
              </div>
            ))
          ) : isEmployer ? (
            employerLinks.map((group, idx) => (
              <div key={idx} className="dash-nav-group">
                {group.label && <div className="dash-nav-label">{group.label}</div>}
                {renderNavItems(group.items)}
              </div>
            ))
          ) : (
            <div className="dash-nav-group">
              {renderNavItems(isSeller ? sellerLinks : isAdmin ? adminLinks : [])}
            </div>
          )}
        </nav>

        <div className="dash-sidebar__footer">
          <div className="dash-user-card" onClick={handleLogout}>
            <div className="dash-user-avatar">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="dash-user-info">
              <div className="dash-user-name">Sign out</div>
              <div className="dash-user-role">Log out of account</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dash-main">
        <div className="dash-topbar">
          <div>
            <div className="dash-topbar__title">{title}</div>
            <div className="dash-topbar__crumb">Dashboard / {title}</div>
          </div>
          <div className="dash-topbar__actions flex items-center gap-2">
            <button 
              className="dash-icon-btn md:hidden" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button className="dash-icon-btn" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="dash-icon-btn__dot"></span>
            </button>
            <button className="dash-icon-btn" aria-label="Help">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden bg-c800 border-b border-c700 p-4 flex flex-col gap-2 absolute w-full z-50 shadow-lg left-0 overflow-y-auto" style={{ top: '60px', maxHeight: '80vh' }}>
            {isSeeker ? (
              seekerLinks.map((group, idx) => (
                <div key={idx} className="mb-4">
                  {group.label && <div className="text-xs font-bold text-c500 uppercase tracking-wider mb-2 px-3">{group.label}</div>}
                  {renderNavItems(group.items)}
                </div>
              ))
            ) : isEmployer ? (
              employerLinks.map((group, idx) => (
                <div key={idx} className="mb-4">
                  {group.label && <div className="text-xs font-bold text-c500 uppercase tracking-wider mb-2 px-3">{group.label}</div>}
                  {renderNavItems(group.items)}
                </div>
              ))
            ) : (
              <div className="mb-4">
                {renderNavItems(isSeller ? sellerLinks : isAdmin ? adminLinks : [])}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-c700">
              <button onClick={handleLogout} className="dash-nav-item w-full flex items-center text-red">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}

        <div className="dash-content">
          {children}
        </div>
      </div>
    </div>
  );
}
