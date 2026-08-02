import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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

export interface CampaignAdvertiser {
  id: string;
  email: string;
  name: string;
}

export interface CampaignJob {
  id: string;
  title: string;
}

export type AdCampaignWithDetails = AdCampaign & {
  advertiser: CampaignAdvertiser | null;
  job: CampaignJob | null;
};

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
      redirectUrl: `${process.env.WEB_URL || process.env.FRONTEND_URL || 'http://localhost:3001'}/advertise?payment=success&reference=${reference}`,
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
        },
      ],
    });
  }

  async initializeOwnedAdPayment(
    advertiserId: string,
    campaignId: string,
    gatewayName: string,
    customerEmail: string,
    customerName: string,
  ) {
    await this.findOwnedCampaign(advertiserId, campaignId);
    return this.initializeAdPayment(
      campaignId,
      gatewayName,
      customerEmail,
      customerName,
    );
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

  private async withSignedCreativeUrl(campaign: AdCampaign) {
    if (!campaign.image_url || /^https?:\/\//.test(campaign.image_url)) {
      return campaign;
    }

    const { data } = await this.supabase.storage
      .from('ad-creatives')
      .createSignedUrl(campaign.image_url, 3600);

    return {
      ...campaign,
      image_url: data?.signedUrl || campaign.image_url,
    } as AdCampaign;
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
    currentUser?: unknown,
  ): Promise<AdCampaign | null> {
    const now = new Date();

    let query = this.campaignRepo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('c.placements @> :placement', {
        placement: JSON.stringify([placement]),
      })
      .andWhere('c.starts_at <= :now', { now })
      .andWhere('(c.ends_at IS NULL OR c.ends_at >= :now)', { now })
      .andWhere('c.total_spent < c.total_budget');

    // Apply targeting filters if user is logged in
    if (
      currentUser &&
      typeof currentUser === 'object' &&
      currentUser !== null
    ) {
      const user = currentUser as Record<string, unknown>;
      if (user.state) {
        query = query.andWhere(
          '(c.target_states IS NULL OR c.target_states @> :state)',
          { state: JSON.stringify([user.state]) },
        );
      }
      if (user.area) {
        query = query.andWhere(
          '(c.target_areas IS NULL OR c.target_areas @> :area)',
          { area: JSON.stringify([user.area]) },
        );
      }
      if (user.industry) {
        query = query.andWhere(
          '(c.target_industries IS NULL OR c.target_industries @> :industry)',
          { industry: JSON.stringify([user.industry]) },
        );
      }
      if (user.role) {
        query = query.andWhere(
          '(c.target_user_types IS NULL OR c.target_user_types @> :role)',
          { role: JSON.stringify([user.role]) },
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

    return this.withSignedCreativeUrl(selected);
  }

  estimateReach(params: {
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
      baseAudience *= params.target_states.length * 0.1; // rough estimate
    }
    if (params.target_industries?.length) {
      baseAudience *= params.target_industries.length * 0.15;
    }
    if (params.target_roles?.length) {
      baseAudience *= params.target_roles.length * 0.05;
    }
    if (params.target_user_types?.length) {
      baseAudience *= params.target_user_types.length * 0.3;
    }

    baseAudience = Math.max(100, Math.floor(baseAudience)); // Min 100 people

    // 2. Budget constraints
    // Assuming 1 NGN = 1 Impression. Reach is about 80% of impressions.
    const budget = Number(params.daily_budget) || 0;
    const maxDailyImpressions = budget / (this.CPM_RATE / 1000);
    const estimatedDailyReach = Math.min(
      baseAudience,
      Math.floor(maxDailyImpressions * 0.8),
    );

    // 3. CTR Estimation
    let ctr = 0.01; // 1% default
    switch (params.format) {
      case 'sponsored_job':
        ctr = 0.035;
        break;
      case 'sponsored_product':
        ctr = 0.025;
        break;
      case 'banner':
        ctr = 0.008;
        break;
      case 'sidebar':
        ctr = 0.005;
        break;
    }

    // Add some random fuzziness based on targeting granularity
    const targetingScore = [
      params.target_states,
      params.target_industries,
      params.target_roles,
    ].filter(Boolean).length;
    ctr += targetingScore * 0.002;

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
    if (!data.goal || !data.format || !data.destination_url) {
      throw new BadRequestException(
        'Choose a campaign objective, ad format, and destination.',
      );
    }

    if (data.goal === 'promote_job' && !data.job_id) {
      throw new BadRequestException('Choose an active job post to promote.');
    }

    if (data.goal === 'promote_product' && !data.product_id) {
      throw new BadRequestException(
        'Choose an active marketplace listing to promote.',
      );
    }

    if (Number(data.daily_budget) < 1000) {
      throw new BadRequestException('Minimum daily budget is ₦1,000.');
    }

    if (Number(data.total_budget) < Number(data.daily_budget)) {
      throw new BadRequestException(
        'Total budget must cover at least one day of delivery.',
      );
    }

    if (
      data.starts_at &&
      data.ends_at &&
      new Date(data.ends_at) <= new Date(data.starts_at)
    ) {
      throw new BadRequestException('End date must be after the start date.');
    }

    if (data.headline && data.headline.length > 80) {
      throw new BadRequestException('Headline must be 80 characters or fewer.');
    }

    if (data.body_text && data.body_text.length > 200) {
      throw new BadRequestException(
        'Body text must be 200 characters or fewer.',
      );
    }

    if (data.job_id) {
      const ownedJob = await this.entityManager.query(
        `SELECT "id" FROM "jobs" WHERE "id" = $1 AND "employerId" = $2 AND "status" = 'active' LIMIT 1`,
        [data.job_id, advertiserId],
      );
      if (!ownedJob.length) {
        throw new ForbiddenException(
          'Choose an active job post belonging to your company.',
        );
      }
    }

    if (data.product_id) {
      const ownedProduct = await this.entityManager.query(
        `SELECT "id" FROM "shop_products" WHERE "id" = $1 AND "sellerId" = $2 AND "isActive" = true LIMIT 1`,
        [data.product_id, advertiserId],
      );
      if (!ownedProduct.length) {
        throw new ForbiddenException(
          'Choose an active marketplace listing belonging to your account.',
        );
      }
    }

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

  @OnEvent('payment.success.ad_campaign')
  async handleAdCampaignPaymentSuccess(payload: {
    campaignId: string;
    txRef: string;
  }) {
    console.log(
      `[AdsService] Received payment success event for campaign ${payload.campaignId}`,
    );
    try {
      await this.confirmPayment(
        payload.campaignId,
        payload.txRef,
        PaymentGateway.FLUTTERWAVE,
      );
    } catch (err) {
      console.error(
        `[AdsService] Failed to confirm payment for campaign ${payload.campaignId}`,
        err,
      );
    }
  }

  async getMyCampaigns(advertiserId: string, page = 1, limit = 10) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(Math.max(limit, 1), 50)
      : 10;
    const [campaigns, total] = await this.campaignRepo.findAndCount({
      where: { advertiser_id: advertiserId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    const data = await this.attachDetailsToCampaigns(campaigns);
    return { data, meta: { total, page: safePage, limit: safeLimit } };
  }

  private async findOwnedCampaign(advertiserId: string, id: string) {
    const campaign = await this.campaignRepo.findOne({
      where: { id, advertiser_id: advertiserId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found.');
    return campaign;
  }

  async getCampaignForAdvertiser(advertiserId: string, id: string) {
    const campaign = await this.findOwnedCampaign(advertiserId, id);
    const [data] = await this.attachDetailsToCampaigns([campaign]);
    return data;
  }

  async updateCampaign(
    advertiserId: string,
    id: string,
    data: Partial<AdCampaign>,
  ) {
    const campaign = await this.findOwnedCampaign(advertiserId, id);
    if (
      ![CampaignStatus.REJECTED, CampaignStatus.PENDING_PAYMENT].includes(
        campaign.status,
      )
    ) {
      throw new BadRequestException(
        'Only campaigns awaiting payment or rejected by moderation can be edited.',
      );
    }

    const editableFields: (keyof AdCampaign)[] = [
      'goal',
      'format',
      'job_id',
      'product_id',
      'image_url',
      'destination_url',
      'alt_text',
      'headline',
      'body_text',
      'target_countries',
      'target_states',
      'target_areas',
      'target_industries',
      'target_roles',
      'target_user_types',
      'placements',
      'starts_at',
      'ends_at',
      'run_continuously',
      'daily_budget',
      'total_budget',
    ];

    for (const field of editableFields) {
      if (data[field] !== undefined) {
        Reflect.set(campaign, field, data[field]);
      }
    }

    if (campaign.status === CampaignStatus.REJECTED) {
      campaign.status = CampaignStatus.PENDING_PAYMENT;
      campaign.rejection_reason = null;
    }
    return this.campaignRepo.save(campaign);
  }

  async pauseCampaign(advertiserId: string, id: string) {
    const campaign = await this.findOwnedCampaign(advertiserId, id);
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Only active campaigns can be paused.');
    }
    campaign.status = CampaignStatus.PAUSED;
    return this.campaignRepo.save(campaign);
  }

  async resumeCampaign(advertiserId: string, id: string) {
    const campaign = await this.findOwnedCampaign(advertiserId, id);
    if (campaign.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Only paused campaigns can be resumed.');
    }
    if (Number(campaign.total_spent) >= Number(campaign.total_budget)) {
      throw new BadRequestException('This campaign has spent its full budget.');
    }
    campaign.status = CampaignStatus.ACTIVE;
    return this.campaignRepo.save(campaign);
  }

  async getCampaignAnalytics(advertiserId: string, id: string) {
    const campaign = await this.findOwnedCampaign(advertiserId, id);
    const [impressions, clicks] = await Promise.all([
      this.impressionRepo
        .createQueryBuilder('impression')
        .select("DATE_TRUNC('day', impression.viewed_at)", 'date')
        .addSelect('COUNT(impression.id)', 'count')
        .where('impression.campaign_id = :id', { id })
        .groupBy("DATE_TRUNC('day', impression.viewed_at)")
        .orderBy('date', 'ASC')
        .getRawMany<{ date: string; count: string }>(),
      this.clickRepo
        .createQueryBuilder('click')
        .select("DATE_TRUNC('day', click.clicked_at)", 'date')
        .addSelect('COUNT(click.id)', 'count')
        .where('click.campaign_id = :id', { id })
        .groupBy("DATE_TRUNC('day', click.clicked_at)")
        .orderBy('date', 'ASC')
        .getRawMany<{ date: string; count: string }>(),
    ]);

    const byDate = new Map<
      string,
      { date: string; impressions: number; clicks: number }
    >();
    for (const row of impressions) {
      const date = new Date(row.date).toISOString().slice(0, 10);
      byDate.set(date, { date, impressions: Number(row.count), clicks: 0 });
    }
    for (const row of clicks) {
      const date = new Date(row.date).toISOString().slice(0, 10);
      const current = byDate.get(date) || {
        date,
        impressions: 0,
        clicks: 0,
      };
      current.clicks = Number(row.count);
      byDate.set(date, current);
    }

    return {
      campaignId: campaign.id,
      data: [...byDate.values()],
      totals: {
        impressions: campaign.impression_count,
        clicks: campaign.click_count,
        ctr: campaign.impression_count
          ? Number(
              (
                (campaign.click_count / campaign.impression_count) *
                100
              ).toFixed(2),
            )
          : 0,
        spent: Number(campaign.total_spent),
        remaining: Math.max(
          0,
          Number(campaign.total_budget) - Number(campaign.total_spent),
        ),
      },
    };
  }

  async getBillingHistory(advertiserId: string, page = 1, limit = 10) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(Math.max(limit, 1), 50)
      : 10;
    const [campaigns, total] = await this.campaignRepo.findAndCount({
      where: { advertiser_id: advertiserId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    return {
      data: campaigns.map((campaign) => ({
        id: campaign.id,
        createdAt: campaign.createdAt,
        amount: Number(campaign.total_budget),
        spent: Number(campaign.total_spent),
        currency: campaign.currency,
        paymentRef: campaign.payment_ref,
        gateway: campaign.payment_gateway,
        status: campaign.status,
      })),
      meta: { total, page: safePage, limit: safeLimit },
    };
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────

  private async attachDetailsToCampaigns(
    campaigns: AdCampaign[],
  ): Promise<AdCampaignWithDetails[]> {
    if (campaigns.length === 0) return [];

    const userIds = [...new Set(campaigns.map((c) => c.advertiser_id))];
    const jobIds = [...new Set(campaigns.map((c) => c.job_id).filter(Boolean))];

    const users: CampaignAdvertiser[] = userIds.length
      ? await this.entityManager.query(
          `SELECT id, email, name FROM users WHERE id = ANY($1)`,
          [userIds],
        )
      : [];

    const jobs: CampaignJob[] = jobIds.length
      ? await this.entityManager.query(
          `SELECT id, title FROM jobs WHERE id = ANY($1)`,
          [jobIds],
        )
      : [];

    return Promise.all(
      campaigns.map(async (campaign) => {
        const hydrated = await this.withSignedCreativeUrl(campaign);
        return {
          ...hydrated,
          advertiser:
            users.find((user) => user.id === campaign.advertiser_id) || null,
          job: jobs.find((job) => job.id === campaign.job_id) || null,
        };
      }),
    );
  }

  async getPendingQueue(page = 1, limit = 10) {
    const [campaigns, total] = await this.campaignRepo.findAndCount({
      where: { status: CampaignStatus.PENDING_REVIEW },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const data = await this.attachDetailsToCampaigns(campaigns);
    return { data, meta: { total, page, limit } };
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

  async getAllCampaigns(page = 1, limit = 10) {
    const [campaigns, total] = await this.campaignRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const data = await this.attachDetailsToCampaigns(campaigns);
    return { data, meta: { total, page, limit } };
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
