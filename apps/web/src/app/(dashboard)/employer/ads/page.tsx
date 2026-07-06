'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, Eye, MousePointerClick, TrendingUp, Pause, Play, Edit2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  jobTitle?: string;
  status: string;
  total_budget: number;
  total_spent: number;
  impression_count: number;
  click_count: number;
  currency: string;
  job?: { title: string };
}

export default function EmployerAdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const res = await apiAuth.withToken(token).get('/ads/campaigns');
        if (res.data && Array.isArray(res.data)) {
          // Add default names since entity might not have a direct `name` column, 
          // but we can fallback to job title or a generic name.
          const mapped = res.data.map((c: any, i: number) => ({
            ...c,
            name: c.name || `Campaign ${i + 1}`,
            jobTitle: c.job?.title || 'Unknown Job',
          }));
          setCampaigns(mapped);
        }
      } catch (err) {
        console.error('Failed to load campaigns', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const formatMoney = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'running').length;
  const totalSpend = campaigns.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + Number(c.impression_count || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + Number(c.click_count || 0), 0);

  return (
    <div>
      <div className="dcard mb-6" style={{ background: 'linear-gradient(135deg, var(--blue-10), transparent)', borderColor: 'var(--c-700)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '4px' }}>Ad Campaigns</h1>
            <p style={{ fontSize: '13px', color: 'var(--c-400)' }}>Promote your job listings to reach top talent faster.</p>
          </div>
          <button className="btn btn--primary btn--sm">
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>
      </div>

      <div className="stat-grid mb-8">
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <Megaphone className="w-4 h-4" style={{ color: 'var(--blue-l)' }} /> Active Campaigns
          </div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : activeCampaigns}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--green-light)' }} /> Total Spend
          </div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : formatMoney(totalSpend)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--gold-h)' }} /> Total Impressions
          </div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : totalImpressions.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <MousePointerClick className="w-4 h-4" style={{ color: 'var(--purple-l)' }} /> Total Clicks
          </div>
          <div className="stat-card__value">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : totalClicks.toLocaleString()}</div>
        </div>
      </div>

      <div className="dcard p-0 overflow-hidden">
        <div className="p-6 border-b border-c700">
          <h2 className="font-bold" style={{ color: 'var(--c-100)' }}>All Campaigns</h2>
        </div>
        
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-c400" /></div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center text-c400">
            <Megaphone className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p>You have no active ad campaigns.</p>
            <button className="btn btn--primary btn--sm mt-4">Create your first campaign</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ backgroundColor: 'var(--c-800)', borderBottom: '1px solid var(--c-700)' }} className="text-xs font-semibold uppercase tracking-wider text-c400">
                <tr>
                  <th className="p-4" style={{ color: 'var(--c-400)' }}>Campaign / Job</th>
                  <th className="p-4" style={{ color: 'var(--c-400)' }}>Status</th>
                  <th className="p-4" style={{ color: 'var(--c-400)' }}>Budget / Spent</th>
                  <th className="p-4" style={{ color: 'var(--c-400)' }}>Performance</th>
                  <th className="p-4 text-right" style={{ color: 'var(--c-400)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-c700">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-c800 transition-colors">
                    <td className="p-4">
                      <div className="font-bold" style={{ color: 'var(--c-100)' }}>{camp.name}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>{camp.jobTitle}</div>
                    </td>
                    <td className="p-4">
                      <span className={`tag capitalize ${
                        (camp.status === 'active' || camp.status === 'running') ? 'tag--green' : 
                        camp.status === 'paused' ? 'tag--gold' : ''
                      }`}>
                        {camp.status.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium" style={{ color: 'var(--c-100)' }}>{formatMoney(camp.total_budget, camp.currency)}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>Spent {formatMoney(camp.total_spent, camp.currency)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium" style={{ color: 'var(--c-100)' }}>{camp.impression_count} Views</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>{camp.click_count} Clicks</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {camp.status !== 'ended' && (
                          <button className="p-2 rounded-lg hover:bg-c700 transition-colors" style={{ color: 'var(--c-400)' }} title={camp.status === 'active' ? 'Pause' : 'Resume'}>
                            {camp.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        <button className="p-2 rounded-lg hover:bg-c700 transition-colors" style={{ color: 'var(--c-400)' }} title="Edit Campaign">
                          <Edit2 className="w-4 h-4" />
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
