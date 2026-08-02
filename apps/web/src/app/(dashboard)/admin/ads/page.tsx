'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    Loader2,
    Megaphone,
    MousePointerClick,
    RefreshCw,
    WalletCards,
    X,
    XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiAuth } from '@/lib/api';
import CampaignStatusBadge from '@/components/ads/CampaignStatusBadge';
import { campaignTitle, formatCompactNumber, formatNaira, humanize } from '@/features/ads/format';
import type { AdCampaign, PaginatedResponse } from '@/features/ads/types';

type View = 'queue' | 'all';

const rejectionReasons = [
    'Creative does not meet platform policy',
    'Campaign contains misleading information',
    'Image quality is too low',
    'Destination does not match the campaign',
] as const;

export default function AdminAdsModerationPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [view, setView] = useState<View>('queue');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [approvalCandidate, setApprovalCandidate] = useState<AdCampaign | null>(null);
    const [rejectionCandidate, setRejectionCandidate] = useState<AdCampaign | null>(null);
    const [predefinedReason, setPredefinedReason] = useState('');
    const [rejectionDetail, setRejectionDetail] = useState('');
    const [workingAction, setWorkingAction] = useState<'approve' | 'reject' | null>(null);

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            const endpoint = view === 'queue' ? '/admin/ads/queue' : '/admin/ads/all';
            const response = await apiAuth.withToken(token || undefined).get<PaginatedResponse<AdCampaign>>(endpoint, { params: { page, limit: 10 } });
            setCampaigns(Array.isArray(response.data?.data) ? response.data.data : []);
            setTotal(response.data?.meta?.total || 0);
            setLimit(response.data?.meta?.limit || 10);
        } catch (requestError) {
            const request = requestError as { response?: { status?: number; data?: { message?: string } } };
            if (request.response?.status === 401 || request.response?.status === 403) {
                router.push('/auth/signin');
                return;
            }
            setError(request.response?.data?.message || "We couldn't load the ad moderation queue. Try again.");
        } finally {
            setLoading(false);
        }
    }, [limit, page, router, view]);

    useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

    const switchView = (nextView: View) => {
        setView(nextView);
        setPage(1);
    };

    const approveCampaign = async () => {
        if (!approvalCandidate) return;
        setWorkingAction('approve');
        try {
            const token = localStorage.getItem('access_token');
            await apiAuth.withToken(token || undefined).patch(`/admin/ads/${approvalCandidate.id}/approve`);
            toast.success('Campaign approved and activated.');
            setApprovalCandidate(null);
            await loadCampaigns();
        } catch (requestError) {
            const request = requestError as { response?: { data?: { message?: string } } };
            toast.error(request.response?.data?.message || 'Campaign was not approved. Try again.');
        } finally {
            setWorkingAction(null);
        }
    };

    const rejectCampaign = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!rejectionCandidate) return;
        const reason = [predefinedReason, rejectionDetail.trim()].filter(Boolean).join(' — ');
        if (!reason) {
            toast.error('Add a clear rejection reason.');
            return;
        }
        setWorkingAction('reject');
        try {
            const token = localStorage.getItem('access_token');
            await apiAuth.withToken(token || undefined).patch(`/admin/ads/${rejectionCandidate.id}/reject`, { reason });
            toast.success('Campaign rejected with feedback.');
            setRejectionCandidate(null);
            setPredefinedReason('');
            setRejectionDetail('');
            await loadCampaigns();
        } catch (requestError) {
            const request = requestError as { response?: { data?: { message?: string } } };
            toast.error(request.response?.data?.message || 'Campaign was not rejected. Try again.');
        } finally {
            setWorkingAction(null);
        }
    };

    const openRejectionDialog = (campaign: AdCampaign) => {
        setRejectionCandidate(campaign);
        setPredefinedReason('');
        setRejectionDetail('');
    };

    const closeRejectionDialog = () => {
        if (workingAction) return;
        setRejectionCandidate(null);
        setPredefinedReason('');
        setRejectionDetail('');
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="ads-admin-page">
            <header className="ads-admin-header">
                <div>
                    <p className="ads-eyebrow"><Megaphone aria-hidden="true" /> Platform moderation</p>
                    <h1>Ad campaign review</h1>
                    <p>Review paid campaigns before they begin delivery across Tutaly.</p>
                </div>
                <button type="button" className="btn btn--ghost" onClick={loadCampaigns} disabled={loading}><RefreshCw className={loading ? 'is-spinning' : ''} aria-hidden="true" /> Refresh queue</button>
            </header>

            <div className="ads-admin-tabs" role="tablist" aria-label="Campaign moderation views">
                <button type="button" role="tab" aria-selected={view === 'queue'} className={view === 'queue' ? 'is-active' : ''} onClick={() => switchView('queue')}><Clock3 aria-hidden="true" /> Pending review</button>
                <button type="button" role="tab" aria-selected={view === 'all'} className={view === 'all' ? 'is-active' : ''} onClick={() => switchView('all')}><Megaphone aria-hidden="true" /> All campaigns</button>
                {!loading && <span className="ads-admin-tabs__count">{total} {view === 'queue' ? 'awaiting a decision' : 'campaigns total'}</span>}
            </div>

            {error && <div className="ads-feedback ads-feedback--error" role="alert"><AlertCircle aria-hidden="true" /><div><strong>Moderation queue did not load</strong><span>{error}</span></div><button type="button" onClick={loadCampaigns}>Try again</button></div>}

            <section className="ads-admin-panel" aria-label={view === 'queue' ? 'Campaigns pending review' : 'All ad campaigns'}>
                {loading ? <div className="ads-admin-list" aria-busy="true" aria-label="Loading campaigns">{Array.from({ length: 5 }).map((_, index) => <div className="ads-admin-row ads-admin-row--skeleton" key={index} aria-hidden="true" />)}</div> : campaigns.length === 0 ? <div className="ads-empty-state"><div className="ads-empty-state__visual"><CheckCircle2 aria-hidden="true" /></div><h3>{view === 'queue' ? 'The review queue is clear' : 'No campaigns have been created'}</h3><p>{view === 'queue' ? 'New paid campaigns that need a decision will appear here.' : 'Created campaigns will appear here with their delivery and moderation status.'}</p></div> : <div className="ads-admin-list" role="list">
                    {campaigns.map((campaign) => {
                        const budget = Number(campaign.total_budget || 0);
                        const spent = Number(campaign.total_spent || 0);
                        const progress = budget ? Math.min(100, (spent / budget) * 100) : 0;
                        return <article className="ads-admin-row" key={campaign.id} role="listitem">
                            <div className="ads-admin-row__identity"><span className="ads-campaign-row__icon"><Megaphone aria-hidden="true" /></span><div><strong title={campaignTitle(campaign)}>{campaignTitle(campaign)}</strong><span>{campaign.advertiser?.name || campaign.advertiser?.email || `Advertiser ${campaign.advertiser_id.slice(0, 8)}`}</span><small>{humanize(campaign.goal)} · {humanize(campaign.format)} · {new Date(campaign.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</small></div></div>
                            <div className="ads-admin-row__stat"><span><WalletCards aria-hidden="true" /> Budget</span><strong>{formatNaira(budget)}</strong><small>{formatNaira(spent)} delivered</small><span className="ads-progress" role="progressbar" aria-label={`${campaignTitle(campaign)} budget spent`} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span aria-hidden="true" style={{ transform: `scaleX(${progress / 100})` }} /></span></div>
                            <div className="ads-admin-row__performance"><span><Eye aria-hidden="true" /><strong>{formatCompactNumber(campaign.impression_count)}</strong><small>impressions</small></span><span><MousePointerClick aria-hidden="true" /><strong>{formatCompactNumber(campaign.click_count)}</strong><small>clicks</small></span></div>
                            <CampaignStatusBadge status={campaign.status} />
                            <div className="ads-admin-row__actions">{campaign.status === 'pending_review' ? <><button type="button" className="btn btn--primary btn--sm" onClick={() => setApprovalCandidate(campaign)}><CheckCircle2 aria-hidden="true" /> Approve</button><button type="button" className="btn btn--ghost btn--sm ads-admin-reject" onClick={() => openRejectionDialog(campaign)}><XCircle aria-hidden="true" /> Reject</button></> : <span>No moderation action</span>}</div>
                        </article>;
                    })}
                </div>}
            </section>

            {!loading && totalPages > 1 && <nav className="ads-admin-pagination" aria-label="Campaign queue pages"><button type="button" className="ads-icon-button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft aria-hidden="true" /></button><span>Page <strong>{page}</strong> of {totalPages}</span><button type="button" className="ads-icon-button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} aria-label="Next page"><ChevronRight aria-hidden="true" /></button></nav>}

            {approvalCandidate && <div className="ads-dialog-layer"><button type="button" className="ads-dialog-backdrop" onClick={() => !workingAction && setApprovalCandidate(null)} aria-label="Close approval dialog" /><section className="ads-dialog" role="dialog" aria-modal="true" aria-labelledby="ads-approve-title" aria-describedby="ads-approve-description"><span className="ads-dialog__icon ads-dialog__icon--success"><CheckCircle2 aria-hidden="true" /></span><h2 id="ads-approve-title">Approve this campaign?</h2><p id="ads-approve-description"><strong>{campaignTitle(approvalCandidate)}</strong> will become active and may begin spending its approved budget immediately.</p><div className="ads-dialog__actions"><button type="button" className="btn btn--ghost" onClick={() => setApprovalCandidate(null)} disabled={workingAction !== null}>Cancel</button><button type="button" className="btn btn--primary" onClick={approveCampaign} disabled={workingAction !== null} autoFocus>{workingAction === 'approve' ? <Loader2 className="is-spinning" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />} {workingAction === 'approve' ? 'Approving…' : 'Approve campaign'}</button></div></section></div>}

            {rejectionCandidate && <div className="ads-dialog-layer"><button type="button" className="ads-dialog-backdrop" onClick={closeRejectionDialog} aria-label="Close rejection dialog" /><form className="ads-dialog ads-dialog--form" role="dialog" aria-modal="true" aria-labelledby="ads-reject-title" onSubmit={rejectCampaign}><button type="button" className="ads-dialog__close ads-icon-button" onClick={closeRejectionDialog} disabled={workingAction !== null} aria-label="Close rejection dialog"><X aria-hidden="true" /></button><span className="ads-dialog__icon ads-dialog__icon--danger"><XCircle aria-hidden="true" /></span><h2 id="ads-reject-title">Reject campaign with feedback</h2><p>Give the advertiser a specific reason they can act on before submitting again.</p><label className="ads-field"><span className="ads-field__label">Common reason</span><select className="ads-input" value={predefinedReason} onChange={(event) => setPredefinedReason(event.target.value)} autoFocus><option value="">Choose a reason</option>{rejectionReasons.map((reason) => <option value={reason} key={reason}>{reason}</option>)}</select></label><label className="ads-field"><span className="ads-field__label">Additional detail</span><textarea className="ads-input ads-input--textarea" value={rejectionDetail} onChange={(event) => setRejectionDetail(event.target.value)} placeholder="Explain what needs to change." maxLength={500} /><small>{rejectionDetail.length}/500</small></label><div className="ads-dialog__actions"><button type="button" className="btn btn--ghost" onClick={closeRejectionDialog} disabled={workingAction !== null}>Cancel</button><button type="submit" className="btn btn--primary ads-admin-reject-button" disabled={workingAction !== null || (!predefinedReason && !rejectionDetail.trim())}>{workingAction === 'reject' ? <Loader2 className="is-spinning" aria-hidden="true" /> : <XCircle aria-hidden="true" />} {workingAction === 'reject' ? 'Rejecting…' : 'Reject campaign'}</button></div></form></div>}
        </div>
    );
}