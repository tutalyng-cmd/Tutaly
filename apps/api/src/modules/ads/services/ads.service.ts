import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdCampaign } from '../entities/ad-campaign.entity';
import { CampaignStatus, PaymentGateway } from '../enums/ads.enums';

@Injectable()
export class AdsService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(AdCampaign)
    private readonly campaignRepo: Repository<AdCampaign>,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || '',
    );
  }

  // Basic Weighted Random Selection
  private weightedRandom(campaigns: AdCampaign[]): AdCampaign {
    const totalWeight = campaigns.reduce((sum, c) => sum + Number(c.daily_budget), 0);
    let random = Math.random() * totalWeight;
    for (const campaign of campaigns) {
      random -= Number(campaign.daily_budget);
      if (random <= 0) return campaign;
    }
    return campaigns[0];
  }

  async getTodaySpend(campaignId: string): Promise<number> {
    // In a real scenario, this queries the sum of impressions/clicks cost for today.
    // For now, we return 0 so it doesn't block serving.
    return 0;
  }

  private async getNextEligibleCampaign(campaigns: AdCampaign[], excludeId: string): Promise<AdCampaign | null> {
    const filtered = campaigns.filter(c => c.id !== excludeId);
    if (filtered.length === 0) return null;
    return this.weightedRandom(filtered);
  }

  async getActiveAd(placement: string, currentUser?: any): Promise<AdCampaign | null> {
    const now = new Date();

    let query = this.campaignRepo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere(':placement = ANY(c.placements)', { placement })
      .andWhere('c.starts_at <= :now', { now })
      .andWhere('(c.ends_at IS NULL OR c.ends_at >= :now)', { now })
      .andWhere('c.total_spent < c.total_budget');

    // Apply targeting filters if user is logged in
    if (currentUser) {
      if (currentUser.state) {
        query = query.andWhere(
          '(c.target_states IS NULL OR :state = ANY(c.target_states))',
          { state: currentUser.state },
        );
      }
      if (currentUser.industry) {
        query = query.andWhere(
          '(c.target_industries IS NULL OR :industry = ANY(c.target_industries))',
          { industry: currentUser.industry },
        );
      }
      if (currentUser.role) {
        query = query.andWhere(
          '(c.target_user_types IS NULL OR :role = ANY(c.target_user_types))',
          { role: currentUser.role },
        );
      }
    }

    const campaigns = await query.getMany();
    if (campaigns.length === 0) return null;

    let selected: AdCampaign | null = this.weightedRandom(campaigns);

    const todaySpend = await this.getTodaySpend(selected.id);
    if (todaySpend >= selected.daily_budget) {
      selected = await this.getNextEligibleCampaign(campaigns, selected.id);
      if (!selected) return null;
    }

    return selected;
  }

  async createCampaign(advertiserId: string, data: Partial<AdCampaign>): Promise<AdCampaign> {
    const campaignData = {
      ...data,
      advertiser_id: advertiserId,
      status: CampaignStatus.PENDING_PAYMENT,
    };
    const campaign = this.campaignRepo.create(campaignData);
    return this.campaignRepo.save(campaign);
  }

  async uploadCreative(userId: string, fileBuffer: Buffer, mimetype: string, size: number) {
    if (size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 2MB limit');
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      throw new BadRequestException('Invalid file type. Only PNG, JPG, and WebP are allowed.');
    }

    const ext = mimetype.split('/')[1] || 'png';
    const fileName = `${userId}/creative-${Date.now()}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from('ad-creatives')
      .upload(fileName, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload creative: ${error.message}`);
    }

    const signedUrlData = await this.supabase.storage
      .from('ad-creatives')
      .createSignedUrl(data.path, 3600);

    return {
      success: true,
      message: 'Creative uploaded successfully',
      path: data.path,
      previewUrl: signedUrlData.data?.signedUrl,
    };
  }

  async confirmPayment(campaignId: string, paymentRef: string, gateway: PaymentGateway): Promise<AdCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status !== CampaignStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Campaign is not pending payment');
    }

    // Upfront charging logic:
    // Platform charges the full total_budget upfront. 
    // The entire total_budget represents amount_paid with 0% commission.
    campaign.payment_ref = paymentRef;
    campaign.payment_gateway = gateway;
    campaign.status = CampaignStatus.PENDING_REVIEW;

    return this.campaignRepo.save(campaign);
  }
}

