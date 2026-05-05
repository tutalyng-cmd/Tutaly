'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  Store, 
  AlertTriangle,
  TrendingUp,
  DollarSign
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">System-wide metrics and action items</p>
      </div>

      {/* Actionable Alerts */}
      {(stats?.pendingJobsCount > 0 || stats?.pendingSellersCount > 0 || stats?.flaggedOrdersCount > 0) && (
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
          </ul>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link href="/admin/jobs" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.activeJobs || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue (NGN)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ₦{(stats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Link>
        
        <Link href="/admin/orders" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Commission Earned</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ₦{(stats?.totalCommission || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
