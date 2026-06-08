import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdvertisingService } from '../services/advertising.service';
import { AnnouncementsService } from '../services/announcements.service';
import { LegalPagesService } from '../services/legal-pages.service';

/**
 * Public (no auth) endpoints for ads, announcements, and legal pages.
 * These are consumed by the frontend without requiring authentication.
 */
@Controller()
export class PublicContentController {
  constructor(
    private readonly advertisingService: AdvertisingService,
    private readonly announcementsService: AnnouncementsService,
    private readonly legalPagesService: LegalPagesService,
  ) {}

  // ─── Active Ads ────────────────────────────────────────────────

  @Get('ads/active')
  async getActiveAds(@Query('placement') placement?: string) {
    return this.advertisingService.getActiveAdsByPlacement(placement);
  }

  // ─── Active Announcements ─────────────────────────────────────

  @Get('announcements/active')
  async getActiveAnnouncements() {
    return this.announcementsService.getActiveAnnouncements();
  }

  // ─── Public Legal Pages ────────────────────────────────────────

  @Get('legal/:slug')
  async getLegalPage(@Param('slug') slug: string) {
    return this.legalPagesService.getLegalPageBySlug(slug);
  }
}
