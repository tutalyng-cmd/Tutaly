'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/stats');
      setStats(res.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">System-wide metrics and action items.</p>
      </div>

      {/* Actionable Alerts */}
      {(stats?.pendingJobsCount > 0 || stats?.pendingSellersCount > 0 || stats?.flaggedOrdersCount > 0 || stats?.openDisputesCount > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center text-orange-800 font-semibold mb-2">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Action Required
          </div>
          <ul className="list-disc list-inside text-orange-700 text-sm space-y-1 ml-1">
            {stats.pendingJobsCount > 0 && (
              <li>
                <Link href="/admin/jobs" className="hover:underline">
                  {stats.pendingJobsCount} job(s) pending approval
                </Link>
              </li>
            )}
            {stats.pendingSellersCount > 0 && (
              <li>
                <Link href="/admin/sellers" className="hover:underline">
                  {stats.pendingSellersCount} seller application(s) pending review
                </Link>
              </li>
            )}
            {stats.flaggedOrdersCount > 0 && (
              <li>
                <Link href="/admin/orders" className="hover:underline">
                  {stats.flaggedOrdersCount} flagged order(s) requiring resolution
                </Link>
              </li>
            )}
            {stats.openDisputesCount > 0 && (
              <li>
                <Link href="/admin/disputes" className="hover:underline">
                  {stats.openDisputesCount} open dispute(s) awaiting resolution
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-200 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link href="/admin/jobs" className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 hover:border-green-200 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Jobs</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{stats?.activeJobs || 0}</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 hover:border-teal-200 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Revenue (NGN)</p>
              <p className="text-3xl font-black text-gray-900 mt-2">
                ₦{(stats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center shadow-inner">
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Link>
        
        <Link href="/admin/orders" className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Commission</p>
              <p className="text-3xl font-black text-gray-900 mt-2">
                ₦{(stats?.totalCommission || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Link>

        <Link href="/admin/products" className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 hover:border-orange-200 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Products</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{stats?.totalProducts || 0}</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Link>

        <Link href="/admin/disputes" className="block bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 hover:border-red-200 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Open Disputes</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{stats?.openDisputesCount || 0}</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
