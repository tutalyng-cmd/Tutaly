'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { apiAuth } from '@/lib/api';
import Link from 'next/link';

export default function EditLegalPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchPageDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get(`/admin/legal/${slug}`);
      setTitle(res.data.data.title);
      setContent(res.data.data.content);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
      }
      setError(err.response?.data?.message || err.message || 'Error loading page');
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchPageDetails();
  }, [fetchPageDetails]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).put(`/admin/legal/${slug}`, {
        title,
        content,
      });
      setSuccessMessage('Page updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
setError(err.response?.data?.message || err.message || 'Failed to update page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/legal" className="p-2 bg-c100 text-c500 hover:bg-c200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-c900">Edit {title || 'Document'}</h1>
            <p className="text-c500 mt-1 font-mono text-sm bg-c100 px-2 py-0.5 rounded inline-block">/{slug}</p>
          </div>
        </div>
      </div>

      {error && <div className="text-red bg-red p-4 rounded-lg text-sm font-medium">{error}</div>}
      {successMessage && (
        <div className="text-green bg-green p-4 rounded-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white shadow-sm border border-c100 rounded-3xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-c100 shadow-sm rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 space-y-6 flex-1">
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-c700">Document Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-c300 rounded-xl shadow-sm focus:border-green focus:ring-green py-3 px-4 bg-c100"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <label className="block text-sm font-bold text-c700">Content (HTML Supported)</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border-c300 rounded-xl shadow-sm focus:border-green focus:ring-green py-3 px-4 bg-c100 font-mono text-sm min-h-layout-lg resize-y"
              ></textarea>
              <p className="text-xs text-c500 mt-2">Use valid HTML tags for formatting. Headings, paragraphs, bold, and lists are supported.</p>
            </div>
          </div>

          <div className="bg-c100 p-6 sm:p-8 flex items-center justify-end border-t border-c100">
            <button
              type="submit"
              disabled={saving}
              className="bg-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
