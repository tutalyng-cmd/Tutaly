import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdCampaign } from '../entities/ad-campaign.entity';
import { CampaignStatus } from '../enums/ads.enums';
import { NotificationService } from '../../admin/services/notification.service';
import { NotificationType } from '../../admin/entities/notification.entity';
import type { Job } from 'bull';

@Processor('ads-cron')
export class AdsCronProcessor {
  private readonly logger = new Logger(AdsCronProcessor.name);

  constructor(
    @InjectRepository(AdCampaign)
    private readonly campaignRepo: Repository<AdCampaign>,
    private readonly notificationService: NotificationService,
  ) {}

  @Process('check-ad-budgets')
  async handleCheckBudgets(job: Job) {
    this.logger.log('Checking ad campaigns for daily budgets and end dates...');
    const activeCampaigns = await this.campaignRepo.find({
      where: { status: CampaignStatus.ACTIVE },
    });

    const now = new Date();

    for (const campaign of activeCampaigns) {
      const spent = Number(campaign.total_spent);
      const budget = Number(campaign.total_budget);
      const percentage = (spent / budget) * 100;

      // Check 50%
      if (percentage >= 50 && percentage < 80 && !campaign.notified_50) {
        campaign.notified_50 = true;
        await this.campaignRepo.save(campaign);
        await this.notificationService.createAdNotification(
          campaign.advertiser_id,
          NotificationType.AD_BUDGET_50,
          'Your ad campaign has reached 50% of its budget.',
          campaign.id
        );
      }

      // Check 80%
      if (percentage >= 80 && percentage < 100 && !campaign.notified_80) {
        campaign.notified_80 = true;
        await this.campaignRepo.save(campaign);
        await this.notificationService.createAdNotification(
          campaign.advertiser_id,
          NotificationType.AD_BUDGET_80,
          'Your ad campaign has reached 80% of its budget.',
          campaign.id
        );
      }

      // Check Exhausted
      if (spent >= budget) {
        campaign.status = CampaignStatus.COMPLETED;
        campaign.notified_complete = true;
        await this.campaignRepo.save(campaign);
        this.logger.log(`Campaign ${campaign.id} completed (budget exhausted)`);
        
        await this.notificationService.createAdNotification(
          campaign.advertiser_id,
          NotificationType.AD_BUDGET_EXHAUSTED,
          'Your ad campaign budget is exhausted and the campaign has been paused.',
          campaign.id
        );
      }
      // Check if end date passed
      else if (campaign.ends_at && campaign.ends_at < now) {
        campaign.status = CampaignStatus.COMPLETED;
        await this.campaignRepo.save(campaign);
        this.logger.log(`Campaign ${campaign.id} completed (end date passed)`);
        
        await this.notificationService.createAdNotification(
          campaign.advertiser_id,
          NotificationType.AD_CAMPAIGN_ENDED,
          'Your ad campaign has reached its scheduled end date and is now completed.',
          campaign.id
        );

        // Process refund
        const unspent = budget - spent;
        if (unspent > 100) {
          this.logger.log(`Refunding ₦${unspent} to advertiser for campaign ${campaign.id}`);
          // Mock refund processing
          await this.notificationService.createAdNotification(
            campaign.advertiser_id,
            NotificationType.AD_REFUND_PROCESSED,
            `A refund of ₦${unspent} has been processed for your unspent ad budget.`,
            campaign.id,
            { amount: unspent }
          );
        }
      }
    }
  }

  @Process('weekly-ad-report')
  async handleWeeklyReport(job: Job) {
    this.logger.log('Generating weekly ad reports...');
    
    // We only care about campaigns that are active or were recently completed
    const activeOrRecentlyCompleted = await this.campaignRepo.find({
      where: [
        { status: CampaignStatus.ACTIVE },
        { status: CampaignStatus.COMPLETED }
      ]
    });

    const campaignsByUser = new Map<string, AdCampaign[]>();
    for (const c of activeOrRecentlyCompleted) {
      const arr = campaignsByUser.get(c.advertiser_id) || [];
      arr.push(c);
      campaignsByUser.set(c.advertiser_id, arr);
    }

    for (const [userId, campaigns] of campaignsByUser.entries()) {
      let reportHtml = '<h3 style="color: #0D1B2A;">Your Weekly Ad Performance</h3>';
      
      for (const c of campaigns) {
        reportHtml += `
          <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <strong>Campaign ID:</strong> ${c.id}<br/>
            <strong>Goal:</strong> ${c.goal.replace('_', ' ')}<br/>
            <strong>Impressions:</strong> ${c.impression_count}<br/>
            <strong>Clicks:</strong> ${c.click_count}<br/>
            <strong>Amount Spent:</strong> ₦${Number(c.total_spent).toFixed(2)}<br/>
          </div>
        `;
      }

      await this.notificationService.createAdNotification(
        userId,
        NotificationType.AD_WEEKLY_REPORT,
        'Your weekly ad performance report is ready.',
        campaigns[0].id,
        { reportHtml }
      );
    }
  }
}
