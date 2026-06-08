import { Controller, Post, Get, Body, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdsService } from '../services/ads.service';
import { NotificationService } from '../../admin/services/notification.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('ads/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly notificationService: NotificationService
  ) {}

  @Post()
  @Roles('employer', 'admin') // Block 'seeker'
  async createCampaign(@Req() req, @Body() body: any) {
    // Basic implementation of creating a campaign
    const campaign = await this.adsService.createCampaign(req.user.id, body);
    
    // Trigger payment gateway checkout logic here
    
    return {
      message: 'Campaign created successfully. Proceed to payment.',
      campaign,
    };
  }

  @Post('upload-creative')
  @Roles('employer', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCreative(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    return this.adsService.uploadCreative(
      req.user.sub,
      file.buffer,
      file.mimetype,
      file.size,
    );
  }

  @Get()
  @Roles('employer', 'admin')
  async getMyCampaigns(@Req() req) {
    // Placeholder
    return [];
  }

  @Get('alerts')
  @Roles('employer', 'admin')
  async getAdAlerts(@Req() req) {
    // Fetch all notifications for user, then filter ad-specific types
    // Note: this is a simple implementation. In a real scenario, we would add a method 
    // to NotificationService to query specific types directly.
    const { data } = await this.notificationService.getUserNotifications(req.user.sub, 1, 100);
    const adTypes = [
      'ad_campaign_created',
      'ad_under_review',
      'ad_approved',
      'ad_rejected',
      'ad_budget_50',
      'ad_budget_80',
      'ad_budget_exhausted',
      'ad_campaign_ended',
      'ad_refund_processed',
      'ad_weekly_report'
    ];
    const adAlerts = data.filter(n => adTypes.includes(n.type) && !n.isRead);
    return { alerts: adAlerts };
  }
}
