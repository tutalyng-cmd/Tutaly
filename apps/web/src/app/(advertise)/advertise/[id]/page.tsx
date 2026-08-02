'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Eye,
    ExternalLink,
    Loader2,
    MapPin,
    MousePointerClick,
    Pause,
    Play,
    RefreshCw,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { apiAuth } from '@/lib/api';
import CampaignStatusBadge from '@/components/ads/CampaignStatusBadge';
import { campaignTitle, formatCompactNumber, formatNaira, humanize } from '@/features/ads/format';
import type { AdCampaign, CampaignAnalytics } from '@/features/ads/types';

export default function CampaignDetailPage() {
    const params = useParams<{ id: string }>();
    const [campaign, setCampaign] = useState<AdCampaign | null>(null);
    const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [action, setAction] = useState<'pause' | 'resume' | 'payment' | null>(null);
    const [paymentGateway, setPaymentGateway] = useState<'paystack' | 'flutterwave'>('paystack');

    const loadCampaign = useCallback(async () => {
        if (!params.id) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const client = apiAuth.withToken(token || undefined);
            const [campaignResponse, analyticsResponse] = await Promise.all([
                client.get<AdCampaign>(`/ads/campaigns/${params.id}`),
                client.get<CampaignAnalytics>(`/ads/campaigns/${params.id}/analytics`),
            ]);
            setCampaign(campaignResponse.data);
            setAnalytics(analyticsResponse.data);
        } catch (requestError) {
            const request = requestError as { response?: { data?: { message?: string } } };
            setError(request.response?.data?.message || "We couldn't load this campaign. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => { loadCampaign(); }, [loadCampaign]);

    const updateLifecycle = async (nextAction: 'pause' | 'resume') => {
        if (!campaign) return;
        setAction(nextAction);
        try {
            const token = localStorage.getItem('access_token');
            await apiAuth.withToken(token || undefined).patch(`/ads/campaigns/${campaign.id}/${nextAction}`);
            toast.success(nextAction === 'pause' ? 'Campaign paused.' : 'Campaign resumed.');
            await loadCampaign();
        } catch (requestError) {
            const request = requestError as { response?: { data?: { message?: string } } };
            toast.error(request.response?.data?.message || `Campaign was not ${nextAction === 'pause' ? 'paused' : 'resumed'}. Try again.`);
        } finally { setAction(null); }
    };

    const initializePayment = async () => {
        if (!campaign) return;
        setAction('payment');
        try {
            const token = localStorage.getItem('access_token');
            const response = await apiAuth.withToken(token || undefined).post(`/ads/campaigns/${campaign.id}/payment`, { paymentGateway });
            const paymentUrl = response.data?.paymentLink || response.data?.redirectUrl;
            if (!paymentUrl) throw new Error('Payment link was not returned.');
            window.location.href = paymentUrl;
        } catch (requestError) {
            const request = requestError as { response?: { data?: { message?: string } } };
            toast.error(request.response?.data?.message || 'Payment could not be prepared. Try again.');
            setAction(null);
        }
    };

    if (loading) return <div className="ads-page"><div className="ads-skeleton ads-skeleton--detail" /><div className="ads-metric-grid">{Array.from({ length: 5 }).map((_, index) => <div className="ads-metric-card" key={index}><div className="ads-skeleton ads-skeleton--value" /></div>)}</div><div className="ads-skeleton ads-skeleton--chart" /></div>;

    if (error || !campaign) return <div className="ads-page"><div className="ads-empty-state"><div className="ads-empty-state__visual ads-empty-state__visual--danger"><AlertCircle aria-hidden="true" /></div><h1>Campaign did not load</h1><p>{error}</p><div className="ads-empty-state__actions"><button className="btn btn--primary" onClick={loadCampaign}><RefreshCw aria-hidden="true" /> Try again</button><Link href="/advertise" className="btn btn--ghost"><ArrowLeft aria-hidden="true" /> Campaign overview</Link></div></div></div>;

    const budget = Number(campaign.total_budget || 0);
    const spent = Number(campaign.total_spent || 0);
    const remaining = analytics?.totals.remaining ?? Math.max(0, budget - spent);
    const chartData = analytics?.data || [];

    return (
        <div className="ads-page">
            <header className="ads-detail-header">
                <div>
                    <Link href="/advertise" className="ads-back-link"><ArrowLeft aria-hidden="true" /> Campaign overview</Link>
                    <div className="ads-detail-header__title"><h1>{campaignTitle(campaign)}</h1><CampaignStatusBadge status={campaign.status} /></div>
                    <p>{humanize(campaign.goal)} · {humanize(campaign.format)}</p>
                </div>
                <div className="ads-detail-header__actions">
                    {campaign.status === 'active' && <button className="btn btn--ghost" onClick={() => updateLifecycle('pause')} disabled={action !== null}>{action === 'pause' ? <Loader2 className="is-spinning" /> : <Pause />} Pause campaign</button>}
                    {campaign.status === 'paused' && <button className="btn btn--primary" onClick={() => updateLifecycle('resume')} disabled={action !== null}>{action === 'resume' ? <Loader2 className="is-spinning" /> : <Play />} Resume campaign</button>}
                    <a className="btn btn--ghost" href={campaign.destination_url} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> Open destination</a>
                </div>
            </header>

            {campaign.status === 'rejected' && <div className="ads-feedback ads-feedback--error" role="alert"><AlertCircle aria-hidden="true" /><div><strong>Changes are required</strong><span>{campaign.rejection_reason || 'Review your campaign creative and targeting before trying again.'}</span></div></div>}
            {campaign.status === 'pending_review' && <div className="ads-feedback ads-feedback--info"><InfoIcon /><div><strong>Campaign is in moderation</strong><span>It will not begin delivery until a Tutaly admin approves it.</span></div></div>}
            {campaign.status === 'pending_payment' && <div className="ads-payment-banner"><div><p className="ads-panel__kicker">Action needed</p><h2>Complete payment to send this campaign for review</h2><p>Your campaign is saved but cannot enter moderation until payment succeeds.</p></div><div className="ads-payment-banner__action"><select value={paymentGateway} onChange={(event) => setPaymentGateway(event.target.value as 'paystack' | 'flutterwave')} aria-label="Payment method"><option value="paystack">Paystack</option><option value="flutterwave">Flutterwave</option></select><button className="btn btn--primary" onClick={initializePayment} disabled={action !== null}>{action === 'payment' ? <Loader2 className="is-spinning" /> : <WalletCards />} Pay {formatNaira(budget)}</button></div></div>}

            <section className="ads-metric-grid" aria-label="Campaign performance">
                <article className="ads-metric-card"><div className="ads-metric-card__top"><span>Impressions</span><Eye /></div><strong>{formatCompactNumber(campaign.impression_count)}</strong><small>Times this ad was shown</small></article>
                <article className="ads-metric-card"><div className="ads-metric-card__top"><span>Clicks</span><MousePointerClick /></div><strong>{formatCompactNumber(campaign.click_count)}</strong><small>Visits from this campaign</small></article>
                <article className="ads-metric-card"><div className="ads-metric-card__top"><span>CTR</span><TrendingUp /></div><strong>{(analytics?.totals.ctr || 0).toFixed(2)}%</strong><small>Click-through rate</small></article>
                <article className="ads-metric-card"><div className="ads-metric-card__top"><span>Amount spent</span><WalletCards /></div><strong>{formatNaira(spent)}</strong><small>of {formatNaira(budget)} budget</small></article>
                <article className="ads-metric-card ads-metric-card--gold"><div className="ads-metric-card__top"><span>Remaining budget</span><WalletCards /></div><strong>{formatNaira(remaining)}</strong><small>Available for delivery</small></article>
            </section>

            <div className="ads-detail-grid">
                <section className="ads-panel ads-chart-panel"><div className="ads-panel__header"><div><p className="ads-panel__kicker">Performance</p><h2>Delivery over time</h2></div></div>{chartData.length ? <div className="ads-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}><CartesianGrid stroke="var(--c-700)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="date" stroke="var(--c-400)" fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} /><YAxis stroke="var(--c-400)" fontSize={12} /><Tooltip contentStyle={{ background: 'var(--c-700)', border: '1px solid var(--c-600)', borderRadius: 'var(--r-md)', color: 'var(--c-100)' }} /><Line type="monotone" dataKey="impressions" stroke="var(--blue-l)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="clicks" stroke="var(--gold-h)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div> : <div className="ads-empty-chart"><TrendingUp aria-hidden="true" /><h3>Performance data will appear here</h3><p>The chart fills in as an approved campaign receives impressions and clicks.</p></div>}</section>

                <aside className="ads-panel ads-campaign-summary"><div className="ads-panel__header"><div><p className="ads-panel__kicker">Campaign setup</p><h2>Delivery details</h2></div></div><dl><div><dt><CalendarDays /> Schedule</dt><dd>{new Date(campaign.starts_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })} — {campaign.run_continuously ? 'Continuous' : campaign.ends_at ? new Date(campaign.ends_at).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : 'No end date'}</dd></div><div><dt><MapPin /> Locations</dt><dd>{[...(campaign.target_countries || []), ...(campaign.target_states || []), ...(campaign.target_areas || [])].join(', ') || 'Broad location targeting'}</dd></div><div><dt><WalletCards /> Daily budget</dt><dd>{formatNaira(campaign.daily_budget)}</dd></div><div><dt><TrendingUp /> Placements</dt><dd>{campaign.placements.map(humanize).join(', ')}</dd></div></dl></aside>
            </div>
        </div>
    );
}

function InfoIcon() {
    return <span className="ads-feedback__info-icon" aria-hidden="true">i</span>;
}