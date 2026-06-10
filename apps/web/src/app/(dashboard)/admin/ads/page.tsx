'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Megaphone, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  MousePointerClick,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import { apiAuth } from '@/lib/api';
import Link from 'next/link';

interface Advertiser {
  id: string;
  name: string;
  email: string;
}

interface JobDetails {
  id: string;
  title: string;
}

interface AdCampaign {
  id: string;
  advertiser_id: string;
  job_id: string | null;
  product_id: string | null;
  goal: string;
  format: string;
  status: string;
  total_budget: string | number;
  total_spent: string | number;
  impression_count: number;
  click_count: number;
  starts_at: string;
  ends_at: string | null;
  createdAt: string;
  advertiser?: Advertiser | null;
  job?: JobDetails | null;
}

export default function AdminAdsModerationPage() {
  const router = useRouter();
  
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'queue' | 'all'>('queue');

  // Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingCampaignId, setRejectingCampaignId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [predefinedReason, setPredefinedReason] = useState('');

  const PREDEFINED_REASONS = [
    'Violates Platform Policy',
    'Inappropriate Content',
    'Misleading or False Information',
    'Low Quality Media',
    'Irrelevant to Audience'
  ];

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      
      const endpoint = tab === 'queue' ? '/admin/ads/queue' : '/admin/ads/all';
      const res = await apiAuth.withToken(token || undefined).get(endpoint);
      
      setCampaigns(res.data || []);
    } catch (err: any) {
      const error = err as { response?: { status?: number, data?: { message?: string } }, message?: string };
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(error.response?.data?.message || error.message || 'Error loading campaigns');
    } finally {
      setLoading(false);
    }
  }, [tab, router]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this campaign? It will become active immediately.')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/ads/${id}/approve`);
      fetchCampaigns();
    } catch (err: any) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      alert(error.response?.data?.message || error.message);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingCampaignId(id);
    setRejectReason('');
    setPredefinedReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingCampaignId) return;
    
    const finalReason = predefinedReason 
      ? (rejectReason ? `${predefinedReason} - ${rejectReason}` : predefinedReason)
      : rejectReason;

    if (!finalReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/ads/${rejectingCampaignId}/reject`, {
        reason: finalReason
      });
      setRejectModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      alert(error.response?.data?.message || error.message);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">Awaiting Payment</span>;
      case 'pending_review':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">In Review</span>;
      case 'active':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm">Active</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">Completed</span>;
      case 'paused':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">Paused</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200 shadow-sm">Rejected</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 uppercase shadow-sm">{status.replace('_', ' ')}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-teal-600" />
            Ads Moderation
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Review, approve, and monitor advertiser campaigns across the platform.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-gray-200 pb-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setTab('queue')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
            tab === 'queue' 
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
            tab === 'all' 
              ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20' 
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Campaigns
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl text-sm font-medium shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Campaigns Table / List */}
      <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-gray-200/50 border border-gray-100 rounded-3xl overflow-hidden relative">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-teal-600"></div>
            <p className="text-gray-500 font-medium">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100 shadow-inner">
              <Megaphone className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Queue is Empty</h3>
            <p className="text-gray-500 font-medium max-w-sm">
              {tab === 'queue' 
                ? "There are currently no campaigns waiting for your review. Great job!" 
                : "No campaigns have been created on the platform yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Advertiser / Target</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Budget & Spent</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Metrics</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                  <th scope="col" className="px-6 py-5 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50/80 transition-colors group">
                    
                    {/* Advertiser / Target Column */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-gray-900 text-sm">
                          {campaign.advertiser ? campaign.advertiser.name : campaign.advertiser_id.substring(0,8)}
                        </div>
                        {campaign.advertiser && (
                          <div className="text-xs text-gray-500">{campaign.advertiser.email}</div>
                        )}
                        <div className="mt-3 flex items-start gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {campaign.job ? (
                            <LinkIcon className="w-4 h-4 text-teal-600 mt-0.5" />
                          ) : (
                            <Megaphone className="w-4 h-4 text-blue-500 mt-0.5" />
                          )}
                          <div>
                            <div className="text-xs font-bold text-gray-700 capitalize">
                              {campaign.format.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]" title={campaign.job ? campaign.job.title : 'General Ad'}>
                              {campaign.job ? campaign.job.title : 'General Placement'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Budget & Spent Column */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Budget</div>
                          <div className="text-sm font-black text-gray-900">{formatCurrency(campaign.total_budget)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Spent</div>
                          <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            {formatCurrency(campaign.total_spent)}
                            <span className="text-xs text-gray-400 font-medium">
                              ({Math.round((Number(campaign.total_spent) / Number(campaign.total_budget)) * 100)}%)
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${Number(campaign.total_spent) >= Number(campaign.total_budget) ? 'bg-purple-500' : 'bg-teal-500'}`}
                              style={{ width: `${Math.min(100, (Number(campaign.total_spent) / Number(campaign.total_budget)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Metrics Column */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-bold text-gray-900">{campaign.impression_count}</span>
                          <span className="text-xs text-gray-500">Impressions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="w-4 h-4 text-teal-600" />
                          <span className="text-sm font-bold text-gray-900">{campaign.click_count}</span>
                          <span className="text-xs text-gray-500">Clicks</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-bold text-gray-600">
                            {campaign.impression_count > 0 
                              ? ((campaign.click_count / campaign.impression_count) * 100).toFixed(2) 
                              : '0.00'}% CTR
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-2 items-start">
                        {statusBadge(campaign.status)}
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      {campaign.status === 'pending_review' ? (
                        <div className="flex flex-col gap-2 items-end">
                          <button 
                            onClick={() => handleApprove(campaign.id)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm border border-green-200"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button 
                            onClick={() => openRejectModal(campaign.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-medium text-gray-400 italic">No actions available</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                Reject Campaign
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Please provide a reason for rejecting this ad campaign.</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Common Reasons</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  value={predefinedReason}
                  onChange={(e) => setPredefinedReason(e.target.value)}
                >
                  <option value="">-- Select a reason (optional) --</option>
                  {PREDEFINED_REASONS.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Additional Comments</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all min-h-[100px] resize-y"
                  placeholder="Provide specific details about why this campaign was rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
