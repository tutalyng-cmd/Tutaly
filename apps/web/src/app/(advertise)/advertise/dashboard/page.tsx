'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Campaign {
  id: string;
  format?: string;
  placements?: string[];
  status: string;
  total_spent?: number | string;
  total_budget?: number | string;
  impression_count?: number;
  click_count?: number;
}

export default function AdvertiserDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/ads/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + Number(c.impression_count || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + Number(c.click_count || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8 border-b border-c800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaign Overview</h1>
          <p className="text-c400">Manage your advertising campaigns and track performance.</p>
        </div>
        <Link 
          href="/advertise/create" 
          className="px-6 py-3 bg-brand-blue text-white rounded-lg font-bold hover:bg-brand-blue/90 transition-colors shadow-glow-blue"
        >
          + New Campaign
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="p-6 bg-c900 rounded-xl border border-c800 border-t-4 border-t-brand-gold relative overflow-hidden">
          <div className="text-sm text-c400 uppercase tracking-wider mb-2">Total Spent</div>
          <div className="text-4xl font-mono font-bold text-white">₦{totalSpent.toLocaleString()}</div>
          <div className="absolute -bottom-4 -right-4 text-brand-gold opacity-10 text-8xl">₦</div>
        </div>
        <div className="p-6 bg-c900 rounded-xl border border-c800 border-t-4 border-t-brand-blue relative overflow-hidden">
          <div className="text-sm text-c400 uppercase tracking-wider mb-2">Total Impressions</div>
          <div className="text-4xl font-mono font-bold text-white">{totalImpressions.toLocaleString()}</div>
          <div className="absolute -bottom-4 -right-4 text-brand-blue opacity-10 text-8xl">👁</div>
        </div>
        <div className="p-6 bg-c900 rounded-xl border border-c800 border-t-4 border-t-brand-green relative overflow-hidden">
          <div className="text-sm text-c400 uppercase tracking-wider mb-2">Total Clicks</div>
          <div className="text-4xl font-mono font-bold text-white">{totalClicks.toLocaleString()}</div>
          <div className="absolute -bottom-4 -right-4 text-brand-green opacity-10 text-8xl">👆</div>
        </div>
        <div className="p-6 bg-c900 rounded-xl border border-c800 border-t-4 border-t-brand-red relative overflow-hidden">
          <div className="text-sm text-c400 uppercase tracking-wider mb-2">Avg. CTR</div>
          <div className="text-4xl font-mono font-bold text-white">{avgCTR}%</div>
          <div className="absolute -bottom-4 -right-4 text-brand-red opacity-10 text-8xl">%</div>
        </div>
      </div>

      {/* ACTIVE CAMPAIGNS TABLE */}
      <h2 className="text-2xl font-bold mb-6 text-white">Your Campaigns</h2>
      <div className="bg-c900 rounded-xl border border-c800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-c500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-c500">
            <p>You have no campaigns yet.</p>
            <Link href="/advertise/create" className="text-brand-blue hover:underline mt-2 inline-block">Create your first campaign</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-neutral-950/50 border-b border-c800">
                <tr>
                  <th className="p-5 font-semibold text-c400 uppercase tracking-wider text-sm">Campaign Details</th>
                  <th className="p-5 font-semibold text-c400 uppercase tracking-wider text-sm">Status</th>
                  <th className="p-5 font-semibold text-c400 uppercase tracking-wider text-sm">Spent / Budget</th>
                  <th className="p-5 font-semibold text-c400 uppercase tracking-wider text-sm text-right">Impressions</th>
                  <th className="p-5 font-semibold text-c400 uppercase tracking-wider text-sm text-right">Clicks (CTR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-c800">
                {campaigns.map((c: Campaign) => {
                  const ctr = (c.impression_count || 0) > 0 ? (((c.click_count || 0) / (c.impression_count || 1)) * 100).toFixed(1) : '0.0';
                  const progress = Math.min(100, (Number(c.total_spent) / Number(c.total_budget)) * 100);
                  
                  return (
                    <tr key={c.id} className="hover:bg-c800/50 transition-colors">
                      <td className="p-5">
                        <div className="font-bold text-white text-lg capitalize">{c.format?.replace('_', ' ')}</div>
                        <div className="text-sm text-brand-blue font-mono mt-1 capitalize">{c.placements?.join(', ').replace('_', ' ')}</div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          c.status === 'active' ? 'bg-brand-green/20 text-brand-green border-brand-green/30' :
                          c.status === 'pending_payment' ? 'bg-gold/20 text-gold border-gold/30' :
                          c.status === 'pending_review' ? 'bg-brand-blue/20 text-brand-blue border-brand-blue/30' :
                          'bg-c500/20 text-c400 border-c500/30'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-5 w-64">
                        <div className="font-mono font-medium text-white mb-2 flex justify-between">
                          <span>₦{Number(c.total_spent || 0).toLocaleString()}</span>
                          <span className="text-c500">₦{Number(c.total_budget || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-c800 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </td>
                      <td className="p-5 text-right font-mono text-c300">{c.impression_count || 0}</td>
                      <td className="p-5 text-right font-mono">
                        <span className="text-white">{c.click_count || 0}</span> 
                        <span className="text-c500 ml-2">({ctr}%)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
