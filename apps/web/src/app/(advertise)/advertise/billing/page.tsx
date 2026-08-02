'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CreditCard, FileText, Plus, RefreshCw, WalletCards } from 'lucide-react';
import { apiAuth } from '@/lib/api';
import CampaignStatusBadge from '@/components/ads/CampaignStatusBadge';
import { formatNaira, humanize } from '@/features/ads/format';
import type { BillingRecord, PaginatedResponse } from '@/features/ads/types';

export default function AdvertisingBillingPage() {
    const [records, setRecords] = useState<BillingRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadBilling = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const token = localStorage.getItem('access_token');
            const response = await apiAuth.withToken(token || undefined).get<PaginatedResponse<BillingRecord>>('/ads/campaigns/billing?page=1&limit=50');
            setRecords(response.data?.data || []);
        } catch (requestError) {
            const request = requestError as { response?: { data?: { message?: string } } };
            setError(request.response?.data?.message || "We couldn't load ad billing history. Check your connection and try again.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadBilling(); }, [loadBilling]);
    const totals = useMemo(() => ({ committed: records.reduce((sum, record) => sum + record.amount, 0), spent: records.reduce((sum, record) => sum + record.spent, 0), paid: records.filter((record) => Boolean(record.paymentRef)).length }), [records]);

    return <div className="ads-page"><header className="ads-page-header"><div><p className="ads-eyebrow"><CreditCard /> Advertising billing</p><h1>Spend and payment history</h1><p>Review campaign budgets, payment references, and the amount delivered so far.</p></div><Link href="/advertise/create" className="btn btn--primary"><Plus /> Create campaign</Link></header>
        {error && <div className="ads-feedback ads-feedback--error"><AlertCircle /><div><strong>Billing history did not load</strong><span>{error}</span></div><button onClick={loadBilling}>Try again</button></div>}
        <section className="ads-metric-grid ads-metric-grid--billing"><article className="ads-metric-card"><div className="ads-metric-card__top"><span>Campaign budgets</span><WalletCards /></div><strong>{loading ? '—' : formatNaira(totals.committed)}</strong><small>Total allocated budget</small></article><article className="ads-metric-card"><div className="ads-metric-card__top"><span>Delivered spend</span><CreditCard /></div><strong>{loading ? '—' : formatNaira(totals.spent)}</strong><small>Spend recorded from delivery</small></article><article className="ads-metric-card ads-metric-card--gold"><div className="ads-metric-card__top"><span>Paid campaigns</span><FileText /></div><strong>{loading ? '—' : totals.paid}</strong><small>Payments with references</small></article></section>
        <section className="ads-panel"><div className="ads-panel__header"><div><p className="ads-panel__kicker">Transactions</p><h2>Campaign billing history</h2></div><button className="ads-icon-button" onClick={loadBilling} disabled={loading} aria-label="Refresh billing history"><RefreshCw className={loading ? 'is-spinning' : ''} /></button></div>{loading ? <div className="ads-campaign-list">{Array.from({ length: 5 }).map((_, index) => <div className="ads-campaign-row ads-campaign-row--skeleton" key={index} />)}</div> : records.length === 0 ? <div className="ads-empty-state"><div className="ads-empty-state__visual"><FileText /></div><h3>No ad payments yet</h3><p>Your campaign payment history and references will appear here.</p><Link href="/advertise/create" className="btn btn--primary">Create campaign <ArrowRight /></Link></div> : <div className="ads-billing-table"><div className="ads-billing-table__head"><span>Date</span><span>Campaign</span><span>Method</span><span>Status</span><span>Budget</span><span>Spent</span></div>{records.map((record) => <Link href={`/advertise/${record.id}`} className="ads-billing-row" key={record.id}><span data-label="Date">{new Date(record.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</span><span data-label="Campaign"><strong>{record.paymentRef || `Campaign ${record.id.slice(0, 8)}`}</strong><small>{record.paymentRef ? 'Payment reference' : 'Payment pending'}</small></span><span data-label="Method">{record.gateway ? humanize(record.gateway) : 'Not selected'}</span><span data-label="Status"><CampaignStatusBadge status={record.status} /></span><span data-label="Budget">{formatNaira(record.amount)}</span><span data-label="Spent">{formatNaira(record.spent)}</span></Link>)}</div>}</section>
    </div>;
}