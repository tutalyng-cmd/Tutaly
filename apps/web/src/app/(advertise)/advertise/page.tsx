'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  Filter,
  Megaphone,
  MousePointerClick,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiAuth } from '@/lib/api';
import CampaignStatusBadge from '@/components/ads/CampaignStatusBadge';
import { campaignTitle, formatCompactNumber, formatNaira, humanize } from '@/features/ads/format';
import type { AdCampaign, PaginatedResponse } from '@/features/ads/types';

const filters = ['all', 'active', 'pending_review', 'pending_payment', 'paused', 'rejected', 'completed'] as const;

const statusHighlights = [
  { status: 'pending_review', label: 'In review' },
  { status: 'pending_payment', label: 'Payment needed' },
  { status: 'paused', label: 'Paused' },
] as const;

export default function AdvertiseOverviewPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof filters)[number]>('all');

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await apiAuth.withToken(token || undefined).get<PaginatedResponse<AdCampaign>>('/ads/campaigns?page=1&limit=50');
      setCampaigns(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (requestError) {
      const request = requestError as { response?: { data?: { message?: string } } };
      setError(request.response?.data?.message || "We couldn't load your campaigns. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('Payment received. Campaign sent for review.');
      window.history.replaceState({}, '', '/advertise');
    }
  }, [loadCampaigns]);

  const totals = useMemo(() => {
    const spent = campaigns.reduce((sum, campaign) => sum + Number(campaign.total_spent || 0), 0);
    const impressions = campaigns.reduce((sum, campaign) => sum + Number(campaign.impression_count || 0), 0);
    const clicks = campaigns.reduce((sum, campaign) => sum + Number(campaign.click_count || 0), 0);
    return { spent, impressions, clicks, ctr: impressions ? (clicks / impressions) * 100 : 0, active: campaigns.filter((campaign) => campaign.status === 'active').length };
  }, [campaigns]);

  const visibleCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      const matchesSearch = !normalizedQuery || [campaignTitle(campaign), campaign.format, campaign.goal, campaign.job?.title].some((value) => value?.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, query, statusFilter]);

  const statusCounts = useMemo(() => statusHighlights.map(({ status, label }) => ({
    status,
    label,
    count: campaigns.filter((campaign) => campaign.status === status).length,
  })), [campaigns]);

  return (
    <div className="ads-page">
      <header className="ads-page-header">
        <div>
          <p className="ads-eyebrow"><Sparkles aria-hidden="true" /> Advertising workspace</p>
          <h1>Campaign overview</h1>
          <p>Track delivery, review status, and spend across every Tutaly campaign.</p>
        </div>
        <Link href="/advertise/create" className="btn btn--primary"><Plus aria-hidden="true" /> Create campaign</Link>
      </header>

      {error && <div className="ads-feedback ads-feedback--error" role="alert"><AlertCircle aria-hidden="true" /><div><strong>Campaigns did not load</strong><span>{error}</span></div><button type="button" onClick={loadCampaigns}>Try again</button></div>}

      <section className="ads-metric-grid" aria-label="Campaign performance summary">
        {loading ? Array.from({ length: 5 }).map((_, index) => <div className="ads-metric-card" key={index} aria-hidden="true"><div className="ads-skeleton ads-skeleton--label" /><div className="ads-skeleton ads-skeleton--value" /></div>) : (
          <>
            <article className="ads-metric-card ads-metric-card--gold"><div className="ads-metric-card__top"><span>Active campaigns</span><Megaphone aria-hidden="true" /></div><strong>{totals.active}</strong><small>{campaigns.length} total campaigns</small></article>
            <article className="ads-metric-card"><div className="ads-metric-card__top"><span>Amount spent</span><WalletCards aria-hidden="true" /></div><strong>{formatNaira(totals.spent)}</strong><small>Across all campaigns</small></article>
            <article className="ads-metric-card"><div className="ads-metric-card__top"><span>Impressions</span><Eye aria-hidden="true" /></div><strong>{formatCompactNumber(totals.impressions)}</strong><small>Ads shown to your audience</small></article>
            <article className="ads-metric-card"><div className="ads-metric-card__top"><span>Clicks</span><MousePointerClick aria-hidden="true" /></div><strong>{formatCompactNumber(totals.clicks)}</strong><small>Visits from your campaigns</small></article>
            <article className="ads-metric-card"><div className="ads-metric-card__top"><span>Average CTR</span><TrendingUp aria-hidden="true" /></div><strong>{totals.ctr.toFixed(2)}%</strong><small>Clicks divided by impressions</small></article>
          </>
        )}
      </section>

      {!loading && campaigns.length > 0 && <section className="ads-status-strip" aria-label="Campaign workflow summary">
        <div className="ads-status-strip__intro"><span className="ads-status-strip__marker" aria-hidden="true" /><div><strong>Campaign workflow</strong><span>Keep an eye on campaigns that need your next step.</span></div></div>
        <div className="ads-status-strip__items">
          {statusCounts.map(({ status, label, count }) => <button type="button" className={`ads-status-link ads-status-link--${status}`} key={status} onClick={() => setStatusFilter(status)}><strong>{count}</strong><span>{label}</span></button>)}
        </div>
      </section>}

      <section className="ads-panel">
        <div className="ads-panel__header"><div><p className="ads-panel__kicker">Campaigns</p><h2>Delivery and review status</h2><p>{loading ? 'Loading your latest campaign activity…' : `${visibleCampaigns.length} of ${campaigns.length} campaigns shown`}</p></div><button type="button" className="ads-icon-button" onClick={loadCampaigns} disabled={loading} aria-label="Refresh campaigns"><RefreshCw className={loading ? 'is-spinning' : ''} aria-hidden="true" /></button></div>
        {!loading && campaigns.length > 0 && <div className="ads-toolbar"><label className="ads-search-field"><Search aria-hidden="true" /><span className="sr-only">Search campaigns</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaign or job" /></label><label className="ads-filter-field"><Filter aria-hidden="true" /><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof filters)[number])}>{filters.map((filter) => <option value={filter} key={filter}>{filter === 'all' ? 'All statuses' : humanize(filter)}</option>)}</select></label></div>}

        {loading ? <div className="ads-campaign-list" aria-busy="true">{Array.from({ length: 4 }).map((_, index) => <div className="ads-campaign-row ads-campaign-row--skeleton" key={index} />)}</div> : campaigns.length === 0 ? <div className="ads-empty-state"><div className="ads-empty-state__visual"><Megaphone aria-hidden="true" /></div><h3>Run your first campaign</h3><p>Promote an active job, your company profile, or a marketplace listing to the people most likely to act.</p><Link href="/advertise/create" className="btn btn--primary">Create campaign <ArrowRight aria-hidden="true" /></Link></div> : visibleCampaigns.length === 0 ? <div className="ads-empty-state ads-empty-state--compact"><Search aria-hidden="true" /><h3>No campaigns match these filters</h3><p>Clear your search or choose a different campaign status.</p><button type="button" className="btn btn--ghost" onClick={() => { setQuery(''); setStatusFilter('all'); }}>Clear filters</button></div> : (
          <div className="ads-campaign-list" role="list" aria-label="Your campaigns">
            {visibleCampaigns.map((campaign) => {
              const budget = Number(campaign.total_budget || 0);
              const spent = Number(campaign.total_spent || 0);
              const budgetProgress = budget ? Math.min(100, (spent / budget) * 100) : 0;
              const ctr = campaign.impression_count ? (campaign.click_count / campaign.impression_count) * 100 : 0;
              return <Link className="ads-campaign-row" href={`/advertise/${campaign.id}`} key={campaign.id} role="listitem"><div className="ads-campaign-row__identity"><span className="ads-campaign-row__icon"><Megaphone aria-hidden="true" /></span><span><strong title={campaignTitle(campaign)}>{campaignTitle(campaign)}</strong><small>{humanize(campaign.goal)} · {humanize(campaign.format)}</small></span></div><CampaignStatusBadge status={campaign.status} /><div className="ads-campaign-row__budget"><span><strong>{formatNaira(spent)}</strong> of {formatNaira(budget)}</span><span className="ads-progress" role="progressbar" aria-label={`${campaignTitle(campaign)} budget spent`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(budgetProgress)}><span aria-hidden="true" style={{ transform: `scaleX(${budgetProgress / 100})` }} /></span></div><div className="ads-campaign-row__metric"><strong>{formatCompactNumber(campaign.impression_count)}</strong><small>Impressions</small></div><div className="ads-campaign-row__metric"><strong>{ctr.toFixed(2)}%</strong><small>CTR</small></div><ArrowRight className="ads-campaign-row__arrow" aria-hidden="true" /></Link>;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
