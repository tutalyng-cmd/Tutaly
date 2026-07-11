import { Controller, Get, Post, Query, Body, Req, Ip } from '@nestjs/common';
import { AdsService } from '../services/ads.service';

@Controller('ads')
export class AdsTrackingController {
  constructor(private readonly adsService: AdsService) {}

  @Get('active')
  async getActiveAd(
    @Query('placement') placement: string,
    @Req() req: Record<string, any>,
  ) {
    if (!placement) {
      return { error: 'Placement is required' };
    }

    // Serve ads to ALL users including seekers and guests
    const currentUser = req.user; // Might be undefined if guest, depending on global auth setup

    const ad = await this.adsService.getActiveAd(placement, currentUser);
    return ad ? { ad } : { ad: null };
  }

  @Post('impression')
  async logImpression(
    @Body('campaignId') campaignId: string,
    @Req() req: Record<string, any>,
    @Ip() ip: string,
  ) {
    const visitorId = req.user?.sub || 'guest';
    return this.adsService.recordImpression(campaignId, visitorId, ip);
  }

  @Post('click')
  async logClick(
    @Body('campaignId') campaignId: string,
    @Req() req: Record<string, any>,
    @Ip() ip: string,
  ) {
    const visitorId = req.user?.sub || 'guest';
    return this.adsService.recordClick(campaignId, visitorId, ip);
  }
}
