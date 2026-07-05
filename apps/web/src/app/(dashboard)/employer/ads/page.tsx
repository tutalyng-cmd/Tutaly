'use client';

import React from 'react';
import { Megaphone, Eye, MousePointerClick, TrendingUp, Pause, Play, Edit2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EmployerAdsPage() {
  const campaigns = [
    { id: 'CAMP-001', name: 'Software Engineer - Lagos', job: 'Senior Frontend Developer', status: 'active', budget: '₦15,000', spent: '₦4,500', impressions: '12.4k', clicks: 842 },
    { id: 'CAMP-002', name: 'Product Manager Push', job: 'Product Manager (Remote)', status: 'paused', budget: '₦20,000', spent: '₦12,000', impressions: '24.1k', clicks: 1205 },
    { id: 'CAMP-003', name: 'Urgent Hiring: Designer', job: 'UI/UX Designer', status: 'ended', budget: '₦10,000', spent: '₦10,000', impressions: '8.2k', clicks: 430 },
  ];

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
          <div className="stat-card__value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--green-light)' }} /> Total Spend
          </div>
          <div className="stat-card__value">₦26,500</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--gold-h)' }} /> Total Impressions
          </div>
          <div className="stat-card__value">44.7k</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label flex items-center gap-2">
            <MousePointerClick className="w-4 h-4" style={{ color: 'var(--purple-l)' }} /> Total Clicks
          </div>
          <div className="stat-card__value">2,477</div>
        </div>
      </div>

      <div className="dcard p-0 overflow-hidden">
        <div className="p-6 border-b border-c700">
          <h2 className="font-bold" style={{ color: 'var(--c-100)' }}>All Campaigns</h2>
        </div>
        
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
                    <div className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>{camp.job}</div>
                  </td>
                  <td className="p-4">
                    <span className={`tag capitalize ${
                      camp.status === 'active' ? 'tag--green' : 
                      camp.status === 'paused' ? 'tag--gold' : ''
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium" style={{ color: 'var(--c-100)' }}>{camp.budget}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>Spent {camp.spent}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium" style={{ color: 'var(--c-100)' }}>{camp.impressions} Views</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>{camp.clicks} Clicks</div>
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
      </div>
    </div>
  );
}
