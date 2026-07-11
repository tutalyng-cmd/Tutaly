import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdsService } from '../services/ads.service';
import { NotificationService } from '../../admin/services/notification.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { AdCampaign } from '../entities/ad-campaign.entity';
import { PaymentResponse } from '../../shop/interfaces/payment-gateway.interface';

export interface AuthRequest {
  user: {
    id: string;
    sub: string;
    email?: string;
    name?: string;
  };
}

export interface EstimateReachDto {
  daily_budget: number;
  format: string;
  target_countries?: string[];
  target_states?: string[];
  target_industries?: string[];
  target_roles?: string[];
  target_user_types?: string[];
}

export interface CreateCampaignDto extends Partial<AdCampaign> {
  paymentGateway?: string;
}

@Controller('ads/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('estimate-reach')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  estimateReach(@Body() body: EstimateReachDto) {
    return this.adsService.estimateReach({
      daily_budget: body.daily_budget,
      format: body.format,
      target_countries: body.target_countries,
      target_states: body.target_states,
      target_industries: body.target_industries,
      target_roles: body.target_roles,
      target_user_types: body.target_user_types,
    });
  }

  @Post()
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN) // Block 'seeker'
  async createCampaign(
    @Req() req: AuthRequest,
    @Body() body: CreateCampaignDto,
  ) {
    const { paymentGateway, ...campaignData } = body;

    // Create the campaign
    const campaign = await this.adsService.createCampaign(
      req.user.id,
      campaignData,
    );

    // If paymentGateway is provided, initialize payment immediately
    let paymentInitialization: PaymentResponse | null = null;
    if (paymentGateway && campaign.total_budget > 0) {
      paymentInitialization = await this.adsService.initializeAdPayment(
        campaign.id,
        paymentGateway,
        req.user.email || 'employer@tutaly.com',
        req.user.name || 'Tutaly Employer',
      );
    }

    return {
      message: 'Campaign created successfully.',
      campaign,
      payment: paymentInitialization,
    };
  }

  @Post('upload-creative')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCreative(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
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
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async getMyCampaigns(@Req() req: AuthRequest) {
    return this.adsService.getMyCampaigns(req.user.sub);
  }

  @Get('alerts')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async getAdAlerts(@Req() req: AuthRequest) {
    // Fetch all notifications for user, then filter ad-specific types
    // Note: this is a simple implementation. In a real scenario, we would add a method
    // to NotificationService to query specific types directly.
    const { data } = await this.notificationService.getUserNotifications(
      req.user.sub,
      1,
      100,
    );
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
      'ad_weekly_report',
    ];
    const adAlerts = data.filter((n) => adTypes.includes(n.type) && !n.isRead);
    return { alerts: adAlerts };
  }
}
