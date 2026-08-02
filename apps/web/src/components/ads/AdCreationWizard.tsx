'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    Check,
    CheckCircle2,
    ChevronDown,
    ImagePlus,
    Info,
    LayoutTemplate,
    Loader2,
    Megaphone,
    Package,
    Target,
    UploadCloud,
    Users,
    WalletCards,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiAuth } from '@/lib/api';
import locationsData from '@/data/locations.json';
import { INDUSTRIES } from '@/lib/constants';
import { formatNaira, humanize } from '@/features/ads/format';

type Step = 'objective' | 'targeting' | 'creative' | 'budget' | 'review';
type Goal = 'promote_job' | 'promote_company' | 'promote_product';
type Format = 'banner' | 'sidebar' | 'sponsored_job' | 'sponsored_product';

interface SelectableTarget { id: string; title: string; subtitle: string }
interface Estimation { audience_size: number; estimated_daily_reach: number; estimated_daily_clicks: number }

const steps: Array<{ id: Step; label: string; note: string }> = [
    { id: 'objective', label: 'Objective', note: 'Choose what to promote' },
    { id: 'targeting', label: 'Targeting', note: 'Reach the right audience' },
    { id: 'creative', label: 'Creative', note: 'Write and preview your ad' },
    { id: 'budget', label: 'Budget & schedule', note: 'Set spend and dates' },
    { id: 'review', label: 'Review', note: 'Submit for moderation' },
];

const initialForm = {
    goal: 'promote_job' as Goal,
    targetCountries: ['Nigeria'],
    targetStates: [] as string[],
    targetAreas: [] as string[],
    targetIndustries: [] as string[],
    targetRoles: [] as string[],
    targetUserTypes: ['seeker'],
    format: 'sponsored_job' as Format,
    headline: '',
    bodyText: '',
    destinationUrl: '',
    creativeFile: null as File | null,
    imageUrl: '',
    placements: ['featured_jobs'],
    dailyBudget: 1000,
    totalBudget: 7000,
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: '',
    runContinuously: false,
    targetId: '',
    paymentGateway: 'paystack' as 'paystack' | 'flutterwave',
};

function MultiSelect({ label, values, options, onChange }: { label: string; values: string[]; options: string[]; onChange: (values: string[]) => void }) {
    const [open, setOpen] = useState(false);
    const toggle = (value: string) => onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
    return (
        <div className="ads-field">
            <span className="ads-field__label">{label}</span>
            <button type="button" className="ads-select-button" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span>{values.length ? `${values.length} selected` : `Choose ${label.toLowerCase()}`}</span><ChevronDown aria-hidden="true" />
            </button>
            {open && <div className="ads-option-menu">{options.map((option) => <label className="ads-option" key={option}><input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option)} /><span>{option}</span>{values.includes(option) && <Check aria-hidden="true" />}</label>)}</div>}
            {values.length > 0 && <div className="ads-chip-list">{values.map((value) => <span className="ads-chip" key={value}>{value}</span>)}</div>}
        </div>
    );
}

export default function AdCreationWizard() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('objective');
    const [form, setForm] = useState(initialForm);
    const [estimation, setEstimation] = useState<Estimation | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [targets, setTargets] = useState<SelectableTarget[]>([]);
    const nigeria = locationsData.Nigeria;
    const selectedState = form.targetStates[0] || '';
    const areas = selectedState ? nigeria[selectedState as keyof typeof nigeria] || [] : [];

    useEffect(() => {
        const loadTargets = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const endpoint = form.goal === 'promote_job' ? '/jobs/employer/me' : '/shop/seller/products';
                const response = await apiAuth.withToken(token).get(endpoint);
                const items = response.data?.data || response.data || [];
                setTargets(items.filter((item: { status?: string; isActive?: boolean }) => item.status === 'active' || item.isActive !== false).map((item: { id: string; title?: string; name?: string; jobType?: string; listingType?: string }) => ({ id: item.id, title: item.title || item.name || 'Untitled listing', subtitle: item.jobType || item.listingType || 'Available to promote' })));
            } catch {
                setTargets([]);
            }
        };
        loadTargets();
    }, [form.goal]);

    useEffect(() => {
        if (form.goal === 'promote_job') setForm((current) => ({ ...current, format: 'sponsored_job', placements: ['featured_jobs'] }));
        if (form.goal === 'promote_product') setForm((current) => ({ ...current, format: 'sponsored_product', placements: ['shop_top'] }));
        if (form.goal === 'promote_company') setForm((current) => ({ ...current, format: 'banner', placements: ['homepage_top'] }));
    }, [form.goal]);

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            setIsEstimating(true);
            try {
                const token = localStorage.getItem('access_token');
                const response = await apiAuth.withToken(token || undefined).post('/ads/campaigns/estimate-reach', {
                    daily_budget: form.dailyBudget,
                    format: form.format,
                    target_countries: form.targetCountries,
                    target_states: form.targetStates,
                    target_industries: form.targetIndustries,
                    target_roles: form.targetRoles,
                    target_user_types: form.targetUserTypes,
                });
                setEstimation(response.data);
            } catch {
                setEstimation(null);
            } finally {
                setIsEstimating(false);
            }
        }, 500);
        return () => window.clearTimeout(timer);
    }, [form.dailyBudget, form.format, form.targetCountries, form.targetStates, form.targetIndustries, form.targetRoles, form.targetUserTypes]);

    const setValue = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
    const totalBudget = useMemo(() => {
        if (form.runContinuously) return form.dailyBudget * 30;
        if (!form.endsAt) return form.totalBudget;
        const days = Math.max(1, Math.ceil((new Date(form.endsAt).getTime() - new Date(form.startsAt).getTime()) / 86_400_000));
        return days * form.dailyBudget;
    }, [form.dailyBudget, form.endsAt, form.runContinuously, form.startsAt, form.totalBudget]);

    const validateStep = () => {
        const nextErrors: Record<string, string> = {};
        if (step === 'objective' && !form.targetId) nextErrors.targetId = 'Choose an active item to promote.';
        if (step === 'targeting' && !form.targetUserTypes.length) nextErrors.targetUserTypes = 'Choose at least one audience type.';
        if (step === 'creative') {
            if (!form.headline.trim()) nextErrors.headline = 'Add a clear headline.';
            if (form.headline.length > 80) nextErrors.headline = 'Headline must be 80 characters or fewer.';
            if (!form.bodyText.trim()) nextErrors.bodyText = 'Add the message people will see.';
            if (form.bodyText.length > 200) nextErrors.bodyText = 'Body text must be 200 characters or fewer.';
            if (!form.destinationUrl.trim()) nextErrors.destinationUrl = 'Add a destination for clicks.';
        }
        if (step === 'budget') {
            if (form.dailyBudget < 1000) nextErrors.dailyBudget = 'Minimum daily budget is ₦1,000.';
            if (!form.runContinuously && !form.endsAt) nextErrors.endsAt = 'Choose an end date or run continuously.';
            if (!form.runContinuously && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) nextErrors.endsAt = 'End date must be after the start date.';
        }
        setErrors(nextErrors);
        return !Object.keys(nextErrors).length;
    };

    const goNext = () => {
        if (!validateStep()) return;
        const index = steps.findIndex((item) => item.id === step);
        if (index < steps.length - 1) setStep(steps[index + 1].id);
    };

    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (!form.creativeFile) { setPreviewUrl(''); return; }
        const url = URL.createObjectURL(form.creativeFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.creativeFile]);

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setErrors({ creativeFile: 'This file is too large. Maximum size is 2MB.' }); return; }
        setValue('creativeFile', file);
        setUploading(true);
        try {
            const token = localStorage.getItem('access_token');
            const upload = new FormData();
            upload.append('file', file);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ads/campaigns/upload-creative`, { method: 'POST', body: upload, headers: { Authorization: `Bearer ${token || ''}` }, credentials: 'include' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Upload failed.');
            setValue('imageUrl', result.path || result.previewUrl || '');
            setErrors((current) => ({ ...current, creativeFile: '' }));
        } catch (error) {
            setErrors((current) => ({ ...current, creativeFile: error instanceof Error ? error.message : 'Upload failed. Check your file and try again.' }));
        } finally { setUploading(false); }
    };

    const submitCampaign = async () => {
        if (!validateStep()) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token') || '';
            const response = await apiAuth.withToken(token).post('/ads/campaigns', {
                goal: form.goal,
                format: form.format,
                target_countries: form.targetCountries,
                target_states: form.targetStates,
                target_areas: form.targetAreas,
                target_industries: form.targetIndustries,
                target_roles: form.targetRoles,
                target_user_types: form.targetUserTypes,
                placements: form.placements,
                daily_budget: form.dailyBudget,
                total_budget: totalBudget,
                starts_at: form.startsAt,
                ends_at: form.runContinuously ? null : form.endsAt,
                run_continuously: form.runContinuously,
                image_url: form.imageUrl,
                headline: form.headline,
                body_text: form.bodyText,
                alt_text: form.headline,
                destination_url: form.destinationUrl,
                job_id: form.goal === 'promote_job' ? form.targetId : null,
                product_id: form.goal === 'promote_product' ? form.targetId : null,
                currency: 'NGN',
                paymentGateway: form.paymentGateway,
            });
            const paymentUrl = response.data?.payment?.paymentLink || response.data?.payment?.redirectUrl;
            if (paymentUrl) { window.location.href = paymentUrl; return; }
            toast.success('Campaign created. Complete payment to submit it for review.');
            router.push('/advertise');
        } catch (error) {
            const request = error as { response?: { data?: { message?: string | string[] } } };
            const message = request.response?.data?.message;
            toast.error(Array.isArray(message) ? message.join(' ') : message || 'Campaign was not created. Check the highlighted fields and try again.');
            setIsSubmitting(false);
        }
    };

    const objectiveCopy: Record<Goal, { title: string; desc: string; icon: typeof BriefcaseBusiness }> = {
        promote_job: { title: 'Promote a job post', desc: 'Put an active role in front of qualified candidates.', icon: BriefcaseBusiness },
        promote_company: { title: 'Promote your company', desc: 'Build awareness with professionals exploring their next move.', icon: Megaphone },
        promote_product: { title: 'Promote a marketplace listing', desc: 'Bring the right buyers to an active shop listing.', icon: Package },
    };

    return (
        <div className="ads-create-page">
            <header className="ads-page-header ads-page-header--compact"><div><p className="ads-eyebrow"><Megaphone aria-hidden="true" /> Campaign builder</p><h1>Create a campaign</h1><p>Build a focused campaign. Tutaly reviews every paid campaign before it goes live.</p></div><button type="button" className="btn btn--ghost" onClick={() => router.push('/advertise')}><ArrowLeft aria-hidden="true" /> Back to overview</button></header>
            <div className="ads-builder">
                <aside className="ads-builder__steps" aria-label="Campaign creation steps">
                    {steps.map((item, index) => { const current = item.id === step; const complete = steps.findIndex((candidate) => candidate.id === step) > index; return <button type="button" key={item.id} className={`ads-step ${current ? 'is-current' : ''} ${complete ? 'is-complete' : ''}`} onClick={() => complete || current ? setStep(item.id) : undefined}><span className="ads-step__number">{complete ? <Check aria-hidden="true" /> : index + 1}</span><span><strong>{item.label}</strong><small>{item.note}</small></span></button>; })}
                    <div className="ads-builder__trust"><Info aria-hidden="true" /><span>Paid campaigns enter <strong>pending review</strong> after payment. They do not go live before approval.</span></div>
                </aside>

                <div className="ads-builder__content">
                    {step === 'objective' && <section className="ads-form-card"><div className="ads-form-card__header"><span className="ads-form-card__icon"><Target aria-hidden="true" /></span><div><h2>What should this campaign do?</h2><p>Choose one objective and connect it to a real item you own.</p></div></div><div className="ads-choice-grid">{(Object.keys(objectiveCopy) as Goal[]).map((goal) => { const option = objectiveCopy[goal]; const Icon = option.icon; return <button type="button" className={`ads-choice ${form.goal === goal ? 'is-selected' : ''}`} key={goal} onClick={() => { setValue('goal', goal); setValue('targetId', ''); }}><Icon aria-hidden="true" /><strong>{option.title}</strong><span>{option.desc}</span>{form.goal === goal && <CheckCircle2 aria-hidden="true" />}</button>; })}</div><div className="ads-field ads-field--top"><span className="ads-field__label">{form.goal === 'promote_job' ? 'Active job post' : form.goal === 'promote_product' ? 'Active marketplace listing' : 'Campaign destination'}</span>{form.goal === 'promote_company' ? <input className="ads-input" value={form.destinationUrl} onChange={(event) => setValue('destinationUrl', event.target.value)} placeholder="https://yourcompany.com" /> : <div className="ads-target-list">{targets.length ? targets.map((target) => <button type="button" className={`ads-target-option ${form.targetId === target.id ? 'is-selected' : ''}`} key={target.id} onClick={() => setValue('targetId', target.id)}><span><strong>{target.title}</strong><small>{target.subtitle}</small></span>{form.targetId === target.id && <Check aria-hidden="true" />}</button>) : <div className="ads-inline-note"><Info aria-hidden="true" /> No active items are available for this objective yet. Create and activate one first.</div>}</div>}{form.goal !== 'promote_company' && errors.targetId && <span className="ads-error-text">{errors.targetId}</span>}</div><div className="ads-form-card__footer"><button type="button" className="btn btn--primary" onClick={goNext}>Continue to targeting <ArrowRight aria-hidden="true" /></button></div></section>}

                    {step === 'targeting' && <section className="ads-form-card"><div className="ads-form-card__header"><span className="ads-form-card__icon"><Users aria-hidden="true" /></span><div><h2>Choose your audience</h2><p>Target who sees the campaign. Guests and all roles can still see ads on public pages.</p></div></div><div className="ads-form-grid"><MultiSelect label="Country" values={form.targetCountries} options={Object.keys(locationsData)} onChange={(value) => setForm((current) => ({ ...current, targetCountries: value, targetStates: [], targetAreas: [] }))} /><MultiSelect label="State" values={form.targetStates} options={form.targetCountries.includes('Nigeria') ? Object.keys(nigeria) : []} onChange={(value) => setForm((current) => ({ ...current, targetStates: value.slice(-1), targetAreas: [] }))} /><MultiSelect label="Area / LGA" values={form.targetAreas} options={areas} onChange={(value) => setForm((current) => ({ ...current, targetAreas: value }))} /><MultiSelect label="Industry" values={form.targetIndustries} options={INDUSTRIES} onChange={(value) => setValue('targetIndustries', value)} /><MultiSelect label="Role category" values={form.targetRoles} options={['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Operations', 'Human resources', 'Finance']} onChange={(value) => setValue('targetRoles', value)} /><MultiSelect label="Audience type" values={form.targetUserTypes} options={['seeker', 'employer']} onChange={(value) => setValue('targetUserTypes', value)} /></div>{errors.targetUserTypes && <span className="ads-error-text">{errors.targetUserTypes}</span>}<div className="ads-estimate-card"><div><p className="ads-panel__kicker">Estimated daily results</p><h3>{isEstimating ? 'Updating estimate…' : estimation ? `${estimation.estimated_daily_reach.toLocaleString()} people reached` : 'Add targeting to see an estimate'}</h3><span>Based on your audience and {formatNaira(form.dailyBudget)} daily budget.</span></div><div className="ads-estimate-card__numbers"><span><strong>{estimation?.estimated_daily_clicks.toLocaleString() || '—'}</strong><small>expected clicks</small></span><span><strong>{estimation?.audience_size.toLocaleString() || '—'}</strong><small>available audience</small></span></div></div><div className="ads-form-card__footer"><button type="button" className="btn btn--ghost" onClick={() => setStep('objective')}><ArrowLeft aria-hidden="true" /> Back</button><button type="button" className="btn btn--primary" onClick={goNext}>Continue to creative <ArrowRight aria-hidden="true" /></button></div></section>}

                    {step === 'creative' && <section className="ads-form-card"><div className="ads-form-card__header"><span className="ads-form-card__icon"><LayoutTemplate aria-hidden="true" /></span><div><h2>Make the message clear</h2><p>Use a direct headline, concise body copy, and a real destination.</p></div></div><div className="ads-form-split"><div className="ads-form-fields"><label className="ads-field"><span className="ads-field__label">Headline <em>{form.headline.length}/80</em></span><input className={`ads-input ${errors.headline ? 'has-error' : ''}`} maxLength={80} value={form.headline} onChange={(event) => setValue('headline', event.target.value)} placeholder="e.g. Senior product roles are open in Lagos" />{errors.headline && <span className="ads-error-text">{errors.headline}</span>}</label><label className="ads-field"><span className="ads-field__label">Body text <em>{form.bodyText.length}/200</em></span><textarea className={`ads-input ads-input--textarea ${errors.bodyText ? 'has-error' : ''}`} maxLength={200} rows={5} value={form.bodyText} onChange={(event) => setValue('bodyText', event.target.value)} placeholder="Tell professionals why they should take the next step." />{errors.bodyText && <span className="ads-error-text">{errors.bodyText}</span>}</label><label className="ads-field"><span className="ads-field__label">Destination URL</span><input className={`ads-input ${errors.destinationUrl ? 'has-error' : ''}`} type="url" value={form.destinationUrl} onChange={(event) => setValue('destinationUrl', event.target.value)} placeholder="https://yourcompany.com/role" />{errors.destinationUrl && <span className="ads-error-text">{errors.destinationUrl}</span>}</label><label className="ads-upload"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleUpload(event.target.files?.[0] || null)} /><span className="ads-upload__icon">{uploading ? <Loader2 className="is-spinning" aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}</span><strong>{uploading ? 'Uploading creative…' : form.creativeFile ? form.creativeFile.name : 'Upload a campaign image'}</strong><small>PNG, JPG, or WebP · 2MB maximum</small></label>{errors.creativeFile && <span className="ads-error-text">{errors.creativeFile}</span>}</div><div className="ads-preview-wrap"><p className="ads-panel__kicker">Live preview</p><div className="ads-preview"><div className="ads-preview__label"><Megaphone aria-hidden="true" /> Sponsored</div>{previewUrl ? <div className="ads-preview__image" style={{ backgroundImage: `url(${previewUrl})` }} /> : <div className="ads-preview__image ads-preview__image--empty"><ImagePlus aria-hidden="true" /></div>}<div className="ads-preview__copy"><strong>{form.headline || 'Your campaign headline'}</strong><p>{form.bodyText || 'Your campaign message will appear here.'}</p><span>{form.destinationUrl || 'yourdestination.com'}</span></div></div></div></div><div className="ads-form-card__footer"><button type="button" className="btn btn--ghost" onClick={() => setStep('targeting')}><ArrowLeft aria-hidden="true" /> Back</button><button type="button" className="btn btn--primary" onClick={goNext}>Continue to budget <ArrowRight aria-hidden="true" /></button></div></section>}

                    {step === 'budget' && <section className="ads-form-card"><div className="ads-form-card__header"><span className="ads-form-card__icon"><WalletCards aria-hidden="true" /></span><div><h2>Set budget and schedule</h2><p>Start at ₦1,000 per day. Keep control of spend with a clear end date.</p></div></div><div className="ads-form-grid"><label className="ads-field"><span className="ads-field__label">Daily budget (₦)</span><input className={`ads-input ${errors.dailyBudget ? 'has-error' : ''}`} type="number" min={1000} step={500} value={form.dailyBudget} onChange={(event) => { const value = Number(event.target.value); setValue('dailyBudget', value); if (!form.runContinuously && form.endsAt) setValue('totalBudget', value); }} />{errors.dailyBudget && <span className="ads-error-text">{errors.dailyBudget}</span>}</label><label className="ads-field"><span className="ads-field__label">Start date</span><input className="ads-input" type="date" value={form.startsAt} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setValue('startsAt', event.target.value)} /></label><label className="ads-field"><span className="ads-field__label">End date</span><input className={`ads-input ${errors.endsAt ? 'has-error' : ''}`} type="date" value={form.endsAt} min={form.startsAt} disabled={form.runContinuously} onChange={(event) => setValue('endsAt', event.target.value)} />{errors.endsAt && <span className="ads-error-text">{errors.endsAt}</span>}</label><label className="ads-toggle-field"><input type="checkbox" checked={form.runContinuously} onChange={(event) => setValue('runContinuously', event.target.checked)} /><span><strong>Run continuously</strong><small>Use a 30-day planning estimate. You can pause an active campaign.</small></span></label></div><div className="ads-budget-summary"><span><small>Planned total budget</small><strong>{formatNaira(totalBudget)}</strong></span><span><small>Estimated reach / day</small><strong>{estimation?.estimated_daily_reach.toLocaleString() || '—'}</strong></span></div><div className="ads-form-card__footer"><button type="button" className="btn btn--ghost" onClick={() => setStep('creative')}><ArrowLeft aria-hidden="true" /> Back</button><button type="button" className="btn btn--primary" onClick={goNext}>Review campaign <ArrowRight aria-hidden="true" /></button></div></section>}

                    {step === 'review' && <section className="ads-form-card"><div className="ads-form-card__header"><span className="ads-form-card__icon"><CheckCircle2 aria-hidden="true" /></span><div><h2>Review before payment</h2><p>Check every detail. Your campaign becomes pending review after payment.</p></div></div><div className="ads-review-grid"><div className="ads-review-block"><small>Objective</small><strong>{humanize(form.goal)}</strong><button type="button" onClick={() => setStep('objective')}>Edit</button></div><div className="ads-review-block"><small>Audience</small><strong>{form.targetUserTypes.join(', ')}</strong><span>{[...form.targetStates, ...form.targetIndustries].join(' · ') || 'Broad audience'}</span><button type="button" onClick={() => setStep('targeting')}>Edit</button></div><div className="ads-review-block"><small>Creative</small><strong>{form.headline}</strong><span>{form.destinationUrl}</span><button type="button" onClick={() => setStep('creative')}>Edit</button></div><div className="ads-review-block"><small>Schedule</small><strong>{formatNaira(totalBudget)} total</strong><span>{form.startsAt} · {form.runContinuously ? 'Runs continuously' : `Ends ${form.endsAt}`}</span><button type="button" onClick={() => setStep('budget')}>Edit</button></div></div><div className="ads-review-notice"><Info aria-hidden="true" /><div><strong>Moderation happens after payment</strong><span>Tutaly reviews each campaign for policy and quality. It will not be delivered until an admin approves it.</span></div></div><fieldset className="ads-payment"><legend>Payment method</legend><label className={form.paymentGateway === 'paystack' ? 'is-selected' : ''}><input type="radio" name="paymentGateway" checked={form.paymentGateway === 'paystack'} onChange={() => setValue('paymentGateway', 'paystack')} /> Paystack</label><label className={form.paymentGateway === 'flutterwave' ? 'is-selected' : ''}><input type="radio" name="paymentGateway" checked={form.paymentGateway === 'flutterwave'} onChange={() => setValue('paymentGateway', 'flutterwave')} /> Flutterwave</label></fieldset><div className="ads-form-card__footer"><button type="button" className="btn btn--ghost" onClick={() => setStep('budget')} disabled={isSubmitting}><ArrowLeft aria-hidden="true" /> Back</button><button type="button" className="btn btn--primary" onClick={submitCampaign} disabled={isSubmitting || uploading}>{isSubmitting ? <><Loader2 className="is-spinning" aria-hidden="true" /> Preparing payment…</> : <>Pay {formatNaira(totalBudget)} <ArrowRight aria-hidden="true" /></>}</button></div></section>}
                </div>
            </div>
        </div>
    );
}