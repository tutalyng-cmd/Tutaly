'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, PlusCircle, Trash2, Calendar, PowerOff } from 'lucide-react';
import { apiAuth } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  createdByEmail: string;
}

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/announcements');
      setAnnouncements(res.data.items || []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
      }
      setError(err.response?.data?.message || err.message || 'Error loading announcements');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).post('/admin/announcements', {
        title,
        body,
        expiresAt: expiresAt || undefined,
      });
      
      setShowCreateModal(false);
      setTitle('');
      setBody('');
      setExpiresAt('');
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this announcement?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/announcements/${id}/deactivate`);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Platform Announcements</h1>
          <p className="text-gray-500 mt-1">Push notices and alerts to all users across the platform.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No announcements</h3>
            <p className="text-gray-500 mb-6">Create an announcement to notify your users.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Announcement</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status & Expiry</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Created By</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{ann.title}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-md">{ann.body}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="mb-2">
                        {ann.isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Inactive</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {ann.expiresAt ? `Expires ${new Date(ann.expiresAt).toLocaleDateString()}` : 'No Expiry'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ann.createdByEmail}</div>
                      <div className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {ann.isActive && (
                        <button 
                          onClick={() => handleDeactivate(ann.id)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <PowerOff className="w-4 h-4" /> Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Announcement</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <Trash2 className="w-5 h-5 hidden" />
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
                  placeholder="e.g. System Maintenance Tomorrow"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Message Body</label>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50 min-h-[100px] resize-y"
                  placeholder="Details of the announcement..."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-teal-500 focus:ring-teal-500 py-3 px-4 bg-gray-50"
                />
                <p className="text-xs text-gray-500">Leave blank for a permanent announcement.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title || !body}
                  className="flex-1 bg-teal-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
