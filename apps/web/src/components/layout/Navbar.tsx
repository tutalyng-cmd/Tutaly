'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check local storage for auth stat on client side mount
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    // Recheck on focus in case they logged in on another tab
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, []);
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
