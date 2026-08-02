import { campaignStatusLabel } from '@/features/ads/format';
import type { CampaignStatus } from '@/features/ads/types';

export default function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
    return (
        <span className={`ads-status ads-status--${status}`}>
            <span className="ads-status__dot" aria-hidden="true" />
            {campaignStatusLabel[status]}
        </span>
    );
}