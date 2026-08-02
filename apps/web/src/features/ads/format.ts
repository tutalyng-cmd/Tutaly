import type { CampaignStatus } from './types';

export const campaignStatusLabel: Record<CampaignStatus, string> = {
    pending_payment: 'Payment due',
    pending_review: 'In review',
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    rejected: 'Changes required',
    cancelled: 'Cancelled',
};

export function formatNaira(value: number | string) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

export function formatCompactNumber(value: number) {
    return new Intl.NumberFormat('en-NG', {
        notation: value >= 10_000 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
    }).format(value || 0);
}

export function humanize(value?: string | null) {
    if (!value) return 'Campaign';
    return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function campaignTitle(campaign: {
    headline?: string | null;
    job?: { title: string } | null;
    format?: string;
}) {
    return campaign.headline || campaign.job?.title || humanize(campaign.format);
}