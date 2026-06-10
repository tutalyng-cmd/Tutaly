import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdCampaign } from '../entities/ad-campaign.entity';
import { AdImpression } from '../entities/ad-impression.entity';
import { AdClick } from '../entities/ad-click.entity';
import { CampaignStatus, PaymentGateway } from '../enums/ads.enums';
import { PaymentGatewayFactory } from '../../shop/gateways/payment-gateway.factory';
import { PaymentResponse } from '../../shop/interfaces/payment-gateway.interface';
import { Currency } from '../../shop/entities/shop.entity';
import { NotificationService } from '../../admin/services/notification.service';
import { NotificationType } from '../../admin/entities/notification.entity';

@Injectable()
export class AdsService {
  private supabase: SupabaseClient;

  // Assume flat rates: 1 NGN per impression, 50 NGN per click
  private readonly CPM_RATE = 1000; // per 1000 impressions
  private readonly CPC_RATE = 50; // per click

  constructor(
    @InjectRepository(AdCampaign)
    private readonly campaignRepo: Repository<AdCampaign>,
    @InjectRepository(AdImpression)
    private readonly impressionRepo: Repository<AdImpression>,
    @InjectRepository(AdClick)
    private readonly clickRepo: Repository<AdClick>,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly notificationService: NotificationService,
    private readonly entityManager: EntityManager,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || '',
    );
  }

  async initializeAdPayment(
    campaignId: string,
    gatewayName: string,
    customerEmail: string,
    customerName: string,
  ): Promise<PaymentResponse> {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status !== CampaignStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Campaign is not pending payment');
    }

    const gateway = this.paymentGatewayFactory.createByName(gatewayName);

    // Generate a unique reference
    const reference = `AD-${campaign.id.substring(0, 8)}-${Date.now()}`;

    // Payload matches Shop payment interface but only contains 1 "order" which is the Ad
    return gateway.initializePayment({
      reference,
      totalAmount: Number(campaign.total_budget),
      currency: campaign.currency as Currency,
      customerEmail,
      customerName,
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/employer/ads/payment-success?reference=${reference}`,
      metadata: {
        campaign_id: campaign.id,
        payment_type: 'ad_campaign',
      },
      orders: [
        {
          id: campaign.id,
          paymentRef: reference,
          amountPaid: campaign.total_budget,
          currency: campaign.currency as Currency,
        } as any,
      ],
    });
  }

  // Basic Weighted Random Selection
  private weightedRandom(campaigns: AdCampaign[]): AdCampaign {
    const totalWeight = campaigns.reduce(
      (sum, c) => sum + Number(c.daily_budget),
      0,
    );
    let random = Math.random() * totalWeight;
    for (const campaign of campaigns) {
      random -= Number(campaign.daily_budget);
      if (random <= 0) return campaign;
    }
    return campaigns[0];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getTodaySpend(_campaignId: string): Promise<number> {
    // In a real scenario, this queries the sum of impressions/clicks cost for today.
    // For now, we return 0 so it doesn't block serving.
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async getNextEligibleCampaign(
    campaigns: AdCampaign[],
    excludeId: string,
  ): Promise<AdCampaign | null> {
    const filtered = campaigns.filter((c) => c.id !== excludeId);
    if (filtered.length === 0) return null;
    return this.weightedRandom(filtered);
  }

  async getActiveAd(
    placement: string,
    currentUser?: any,
  ): Promise<AdCampaign | null> {
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

  async estimateReach(params: {
    daily_budget: number;
    format: string;
    target_countries?: string[];
    target_states?: string[];
    target_industries?: string[];
    target_roles?: string[];
    target_user_types?: string[];
  }) {
    // 1. Calculate Base Audience Size
    let baseAudience = 5000000; // 5M base mock audience

    if (params.target_countries?.length) {
      if (!params.target_countries.includes('Nigeria')) baseAudience *= 0.1;
    }
    if (params.target_states?.length) {
      baseAudience *= (params.target_states.length * 0.1); // rough estimate
    }
    if (params.target_industries?.length) {
      baseAudience *= (params.target_industries.length * 0.15);
    }
    if (params.target_roles?.length) {
      baseAudience *= (params.target_roles.length * 0.05);
    }
    if (params.target_user_types?.length) {
      baseAudience *= (params.target_user_types.length * 0.3);
    }

    baseAudience = Math.max(100, Math.floor(baseAudience)); // Min 100 people

    // 2. Budget constraints
    // Assuming 1 NGN = 1 Impression. Reach is about 80% of impressions.
    const budget = Number(params.daily_budget) || 0;
    const maxDailyImpressions = budget / (this.CPM_RATE / 1000); 
    const estimatedDailyReach = Math.min(baseAudience, Math.floor(maxDailyImpressions * 0.8));

    // 3. CTR Estimation
    let ctr = 0.01; // 1% default
    switch (params.format) {
      case 'sponsored_job': ctr = 0.035; break;
      case 'sponsored_product': ctr = 0.025; break;
      case 'banner': ctr = 0.008; break;
      case 'sidebar': ctr = 0.005; break;
    }

    // Add some random fuzziness based on targeting granularity
    const targetingScore = [params.target_states, params.target_industries, params.target_roles].filter(Boolean).length;
    ctr += (targetingScore * 0.002);

    const estimatedDailyClicks = Math.floor(maxDailyImpressions * ctr);

    return {
      audience_size: baseAudience,
      estimated_daily_reach: estimatedDailyReach,
      estimated_daily_clicks: estimatedDailyClicks,
    };
  }

  async createCampaign(
    advertiserId: string,
    data: Partial<AdCampaign>,
  ): Promise<AdCampaign> {
    const campaignData = {
      ...data,
      advertiser_id: advertiserId,
      status: CampaignStatus.PENDING_PAYMENT,
    };
    const campaign = this.campaignRepo.create(campaignData);
    return this.campaignRepo.save(campaign);
  }

  async uploadCreative(
    userId: string,
    fileBuffer: Buffer,
    mimetype: string,
    size: number,
  ) {
    if (size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 2MB limit');
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PNG, JPG, and WebP are allowed.',
      );
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
      throw new BadRequestException(
        `Failed to upload creative: ${error.message}`,
      );
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

  async confirmPayment(
    campaignId: string,
    paymentRef: string,
    gateway: PaymentGateway,
  ): Promise<AdCampaign> {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status !== CampaignStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Campaign is not pending payment');
    }

    campaign.payment_ref = paymentRef;
    campaign.payment_gateway = gateway;
    campaign.status = CampaignStatus.PENDING_REVIEW;

    return this.campaignRepo.save(campaign);
  }

  async getMyCampaigns(advertiserId: string): Promise<any[]> {
    const campaigns = await this.campaignRepo.find({
      where: { advertiser_id: advertiserId },
      order: { createdAt: 'DESC' },
    });
    return this.attachDetailsToCampaigns(campaigns);
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────

  private async attachDetailsToCampaigns(
    campaigns: AdCampaign[],
  ): Promise<any[]> {
    if (campaigns.length === 0) return [];

    const userIds = [...new Set(campaigns.map((c) => c.advertiser_id))];
    const jobIds = [...new Set(campaigns.map((c) => c.job_id).filter(Boolean))];

    const users = userIds.length
      ? await this.entityManager.query(
          `SELECT id, email, name FROM users WHERE id = ANY($1)`,
          [userIds],
        )
      : [];

    const jobs = jobIds.length
      ? await this.entityManager.query(
          `SELECT id, title FROM jobs WHERE id = ANY($1)`,
          [jobIds],
        )
      : [];

    return campaigns.map((c) => ({
      ...c,
      advertiser: users.find((u) => u.id === c.advertiser_id) || null,
      job: jobs.find((j) => j.id === c.job_id) || null,
    }));
  }

  async getPendingQueue(): Promise<any[]> {
    const campaigns = await this.campaignRepo.find({
      where: { status: CampaignStatus.PENDING_REVIEW },
      order: { createdAt: 'ASC' },
    });
    return this.attachDetailsToCampaigns(campaigns);
  }

  async approveCampaign(id: string): Promise<AdCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BadRequestException('Campaign is not pending review');
    }

    campaign.status = CampaignStatus.ACTIVE;
    if (campaign.starts_at < new Date()) {
      campaign.starts_at = new Date();
    }
    await this.campaignRepo.save(campaign);

    await this.notificationService.createAdNotification(
      campaign.advertiser_id,
      NotificationType.AD_APPROVED,
      'Your ad campaign has been approved and is now live.',
      campaign.id,
    );

    return campaign;
  }

  async rejectCampaign(id: string, reason: string): Promise<AdCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BadRequestException('Campaign is not pending review');
    }

    campaign.status = CampaignStatus.REJECTED;
    campaign.rejection_reason = reason;
    await this.campaignRepo.save(campaign);

    await this.notificationService.createAdNotification(
      campaign.advertiser_id,
      NotificationType.AD_REJECTED,
      `Your ad campaign was rejected: ${reason}`,
      campaign.id,
      { reason },
    );

    return campaign;
  }

  async getAllCampaigns(): Promise<any[]> {
    const campaigns = await this.campaignRepo.find({
      order: { createdAt: 'DESC' },
    });
    return this.attachDetailsToCampaigns(campaigns);
  }

  // ─── TRACKING ENDPOINTS ───────────────────────────────────

  async recordImpression(
    campaignId: string,
    visitorId: string,
    _ipAddress: string,
  ): Promise<{ success: boolean }> {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId },
    });
    if (!campaign || campaign.status !== CampaignStatus.ACTIVE)
      return { success: false };

    const impression = this.impressionRepo.create({
      campaign_id: campaignId,
      placement: 'default',
      ...(visitorId !== 'guest' ? { user_id: visitorId } : {}),
      device_type: 'desktop', // default device
      viewed_at: new Date(),
    });
    await this.impressionRepo.save(impression);

    campaign.impression_count += 1;
    campaign.total_spent = Number(campaign.total_spent) + this.CPM_RATE / 1000;

    if (campaign.total_spent >= campaign.total_budget) {
      campaign.status = CampaignStatus.COMPLETED;
    }

    await this.campaignRepo.save(campaign);
    return { success: true };
  }

  async recordClick(
    campaignId: string,
    visitorId: string,
    _ipAddress: string,
  ): Promise<{ success: boolean }> {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId },
    });
    if (!campaign || campaign.status !== CampaignStatus.ACTIVE)
      return { success: false };

    const click = this.clickRepo.create({
      campaign_id: campaignId,
      placement: 'default',
      ...(visitorId !== 'guest' ? { user_id: visitorId } : {}),
      clicked_at: new Date(),
    });
    await this.clickRepo.save(click);

    campaign.click_count += 1;
    campaign.total_spent = Number(campaign.total_spent) + this.CPC_RATE;

    if (campaign.total_spent >= campaign.total_budget) {
      campaign.status = CampaignStatus.COMPLETED;
    }

    await this.campaignRepo.save(campaign);
    return { success: true };
  }
}
