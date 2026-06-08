import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Body,
  UseGuards,
  Request as NestRequest,
} from '@nestjs/common';
import { AccountSettingsService } from '../services/account-settings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserSettingsController {
  constructor(private readonly accountSettingsService: AccountSettingsService) {}

  // ─── ACCOUNT SETTINGS ───────────────────────────────────────

  @Put('settings/email')
  async changeEmail(
    @Body('currentPassword') currentPassword: string,
    @Body('newEmail') newEmail: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.accountSettingsService.changeEmail(req.user.sub, currentPassword, newEmail);
  }

  @Put('settings/password')
  async changePassword(
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.accountSettingsService.changePassword(req.user.sub, currentPassword, newPassword);
  }

  @Delete('account')
  async deleteAccount(
    @Body('currentPassword') currentPassword: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.accountSettingsService.deleteAccount(req.user.sub, currentPassword);
  }

  // ─── NOTIFICATIONS ──────────────────────────────────────────

  @Get('settings/notifications')
  async getNotificationSettings(@NestRequest() req: AuthenticatedRequest) {
    return this.accountSettingsService.getNotificationSettings(req.user.sub);
  }

  @Patch('settings/notifications')
  async updateNotificationSettings(
    @Body() dto: Record<string, boolean>,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.accountSettingsService.updateNotificationSettings(req.user.sub, dto);
  }

  // ─── PRIVACY ────────────────────────────────────────────────

  @Get('settings/privacy')
  async getPrivacySettings(@NestRequest() req: AuthenticatedRequest) {
    return this.accountSettingsService.getPrivacySettings(req.user.sub);
  }

  @Patch('settings/privacy')
  async updatePrivacySettings(
    @Body() dto: any,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.accountSettingsService.updatePrivacySettings(req.user.sub, dto);
  }

  // ─── COOKIES ────────────────────────────────────────────────

  @Get('settings/cookies')
  async getCookieSettings(@NestRequest() req: AuthenticatedRequest) {
    return this.accountSettingsService.getCookieSettings(req.user.sub);
  }

  @Patch('settings/cookies')
  async updateCookieSettings(
    @Body() dto: any,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.accountSettingsService.updateCookieSettings(req.user.sub, dto);
  }
}
