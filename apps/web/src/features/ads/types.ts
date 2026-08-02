export type CampaignStatus =
    | 'pending_payment'
    | 'pending_review'
    | 'active'
    | 'paused'
    | 'completed'
    | 'rejected'
    | 'cancelled';

export interface AdCampaign {
    id: string;
    advertiser_id: string;
    goal: string;
    format: string;
    job_id: string | null;
    product_id: string | null;
    image_url: string | null;
    destination_url: string;
    alt_text: string | null;
    headline: string | null;
    body_text: string | null;
    target_countries: string[] | null;
    target_states: string[] | null;
    target_areas: string[] | null;
    target_industries: string[] | null;
    target_roles: string[] | null;
    target_user_types: string[] | null;
    placements: string[];
    starts_at: string;
    ends_at: string | null;
    run_continuously: boolean;
    daily_budget: number | string;
    total_budget: number | string;
    total_spent: number | string;
    impression_count: number;
    click_count: number;
    status: CampaignStatus;
    rejection_reason: string | null;
    payment_ref: string | null;
    payment_gateway: string | null;
    currency: string;
    createdAt: string;
    updatedAt: string;
    job?: { id: string; title: string } | null;
    advertiser?: { id: string; name: string; email: string } | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface CampaignAnalytics {
    campaignId: string;
    data: Array<{ date: string; impressions: number; clicks: number }>;
    totals: {
        impressions: number;
        clicks: number;
        ctr: number;
        spent: number;
        remaining: number;
    };
}

export interface BillingRecord {
    id: string;
    createdAt: string;
    amount: number;
    spent: number;
    currency: string;
    paymentRef: string | null;
    gateway: string | null;
    status: CampaignStatus;
}