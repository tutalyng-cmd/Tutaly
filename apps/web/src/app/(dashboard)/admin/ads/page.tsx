'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Image as ImageIcon, ExternalLink, Calendar, PauseCircle, PlayCircle, Trash2, Edit } from 'lucide-react';
import { apiAuth } from '@/lib/api';
import Link from 'next/link';

interface Ad {
  id: string;
  type: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminAdsPage() {
  const router = useRouter();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      
      const params: any = { page, limit: 20 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await apiAuth.withToken(token || undefined).get('/admin/ads', { params });
      setAds(res.data.items || []);
      setMeta(res.data.meta || null);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading ads');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, router]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/ads/${id}`, {
        isActive: !currentStatus,
      });
      fetchAds();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).delete(`/admin/ads/${id}`);
      fetchAds();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const statusBadge = (ad: Ad) => {
    const now = new Date();
    const endsAt = new Date(ad.endsAt);
    
    if (endsAt <= now) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Expired</span>;
    }
    if (!ad.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Paused</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Advertising</h1>
          <p className="text-gray-500 mt-1">Manage banner ads, sponsored listings, and placements.</p>
        </div>
        <Link 
          href="/admin/ads/create"
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Create Ad
        </Link>
      </div>

      <div className="flex gap-2 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
        {['all', 'active', 'paused', 'expired'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
              statusFilter === s 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No ads found</h3>
            <p className="text-gray-500 mb-6">You haven't created any advertisements yet.</p>
            <Link 
              href="/admin/ads/create"
              className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700"
            >
              <PlusCircle className="w-5 h-5" /> Create your first ad
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Ad Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Placement & Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200 flex items-center justify-center">
                          {ad.imageUrl ? (
                            <img src={ad.imageUrl} alt="Ad preview" className="object-cover w-full h-full" />
                          ) : (
                            <ImageIcon className="text-gray-400 w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                            Target Link <ExternalLink className="w-3 h-3" />
                          </a>
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{ad.targetUrl}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 capitalize">{ad.placement.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-500 capitalize">{ad.type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" /> 
                        {new Date(ad.startsAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        to {new Date(ad.endsAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(ad)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggleActive(ad.id, ad.isActive)}
                          className={`p-2 rounded-lg transition-colors ${ad.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          title={ad.isActive ? 'Pause Ad' : 'Resume Ad'}
                        >
                          {ad.isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(ad.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Ad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
