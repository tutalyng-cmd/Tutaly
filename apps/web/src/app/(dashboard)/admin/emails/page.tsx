'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Send, History, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { apiAuth } from '@/lib/api';

interface Broadcast {
  id: string;
  subject: string;
  audience: string;
  recipientCount: number;
  sentAt: string;
  sentByEmail: string;
}

export default function AdminEmailsPage() {
  const router = useRouter();
  
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/email/history');
      setHistory(res.data.items || []);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
      }
    } finally {
      setLoadingHistory(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to broadcast this email? This action cannot be undone.')) return;
    
    setSending(true);
    setSendError('');
    setSendSuccess('');
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).post('/admin/email/broadcast', {
        subject,
        body,
        audience,
      });
      
      setSendSuccess(res.data.message || 'Email broadcast sent successfully!');
      setSubject('');
      setBody('');
      fetchHistory(); // Refresh history
      
      setTimeout(() => setSendSuccess(''), 5000);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
setSendError(err.response?.data?.message || err.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-c900">Email Broadcasts</h1>
        <p className="text-c500 mt-1">Send newsletters and system updates to user segments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Compose Form */}
        <div className="bg-white shadow-sm border border-c100 rounded-3xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-c100 bg-c100/50 flex items-center gap-2">
            <Mail className="w-5 h-5 text-green" />
            <h2 className="text-xl font-bold text-c900">Compose Broadcast</h2>
          </div>
          
          <form onSubmit={handleSend} className="p-6 space-y-5 flex-1 flex flex-col">
            {sendSuccess && <div className="bg-green text-green p-4 rounded-xl text-sm font-medium">{sendSuccess}</div>}
            {sendError && <div className="bg-red text-red p-4 rounded-xl text-sm font-medium flex items-start gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{sendError}</div>}
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-c700">Target Audience</label>
              <select
                required
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full border-c300 rounded-xl shadow-sm focus:border-green focus:ring-green py-3 px-4 bg-c100"
              >
                <option value="all">All Active Users</option>
                <option value="seekers">Job Seekers Only</option>
                <option value="employers">Employers Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-c700">Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Important updates from Tutaly"
                className="w-full border-c300 rounded-xl shadow-sm focus:border-green focus:ring-green py-3 px-4 bg-c100"
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="block text-sm font-bold text-c700">Email Body (HTML supported)</label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="<p>Hello there,</p>"
                className="w-full border-c300 rounded-xl shadow-sm focus:border-green focus:ring-green py-3 px-4 bg-c100 flex-1 min-h-52 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sending || !subject || !body}
              className="w-full bg-green text-white px-6 py-3.5 rounded-xl font-bold hover:bg-green shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {sending ? 'Sending Broadcast...' : 'Send Broadcast Now'}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="bg-white shadow-sm border border-c100 rounded-3xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-c100 bg-c100/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-c600" />
              <h2 className="text-xl font-bold text-c900">Broadcast History</h2>
            </div>
            <button onClick={fetchHistory} className="text-sm text-blue hover:text-blueH font-semibold flex items-center gap-1">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingHistory ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center text-c500">
                <Mail className="w-12 h-12 text-c200 mx-auto mb-3" />
                <p>No previous broadcasts found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-c100">
                {history.map((item) => (
                  <li key={item.id} className="p-6 hover:bg-c100 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-c900 truncate">{item.subject}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-c500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span className="capitalize">{item.audience}</span>
                          </span>
                          <span className="font-semibold bg-c100 px-2 py-0.5 rounded-md">
                            {item.recipientCount} sent
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-c500">{new Date(item.sentAt).toLocaleDateString()}</p>
                        <p className="text-xs text-c400 mt-1">{new Date(item.sentAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
