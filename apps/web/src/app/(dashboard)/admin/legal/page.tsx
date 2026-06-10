'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Clock } from 'lucide-react';
import { apiAuth } from '@/lib/api';
import Link from 'next/link';

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
}

export default function AdminLegalPages() {
  const router = useRouter();
  
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/legal');
      setPages(res.data.data || []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
      }
      setError(err.response?.data?.message || err.message || 'Error loading legal pages');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Legal Pages</h1>
        <p className="text-gray-500 mt-1">Manage Terms of Service, Privacy Policy, and other core documents.</p>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>No legal pages found. They may not be seeded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">URL Slug</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">/{page.slug}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/legal/${page.slug}`}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit Content
                      </Link>
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
