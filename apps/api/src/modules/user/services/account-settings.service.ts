import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User } from '../entities/user.entity';
import { UserSettings } from '../entities/user-settings.entity';
import { MailService } from '../../auth/mail.service';
import { TokenService } from '../../auth/token.service';

@Injectable()
export class AccountSettingsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly settingsRepo: Repository<UserSettings>,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── SETTINGS INIT ──────────────────────────────────────────
  private async getOrCreateSettings(userId: string): Promise<UserSettings> {
    let settings = await this.settingsRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!settings) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      settings = this.settingsRepo.create({ user });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  // ─── ACCOUNT OPERATIONS ─────────────────────────────────────
  async changeEmail(userId: string, currentPassword: string, newEmail: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password', 'pendingEmail'],
    });

    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid current password');

    const emailExists = await this.userRepo.findOne({
      where: { email: newEmail },
    });
    if (emailExists) throw new BadRequestException('Email is already in use');

    user.pendingEmail = newEmail;
    await this.userRepo.save(user);

    // Generate token
    const token = this.jwtService.sign(
      { sub: user.id, newEmail, type: 'email-change' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    await this.mailService.sendEmailChangeVerification(newEmail, token);

    return {
      message: 'Verification link sent to the new email address.',
    };
  }

  async confirmEmailChange(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'email-change') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.pendingEmail !== payload.newEmail) {
        throw new BadRequestException('Invalid or expired token');
      }

      user.email = user.pendingEmail as string;
      user.pendingEmail = null;
      await this.userRepo.save(user);

      return { message: 'Email address updated successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'password', 'tokenVersion'],
    });

    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid current password');

    user.password = await bcrypt.hash(newPassword, 12);
    // Invalidate all other sessions
    user.tokenVersion += 1;
    await this.userRepo.save(user);

    // Also revoke refresh tokens
    await this.tokenService.revokeRefreshToken(userId);

    return { message: 'Password changed successfully. All other sessions have been logged out.' };
  }

  async deleteAccount(userId: string, currentPassword: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'password', 'email', 'username', 'isDeleted', 'tokenVersion'],
    });

    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid current password');

    user.isDeleted = true;
    user.isActive = false;
    user.email = `deleted_${Date.now()}@deleted.user`; // Anonymize email
    user.username = `deleted_${Date.now()}`;
    user.tokenVersion += 1; // Invalidate sessions
    
    await this.userRepo.save(user);
    await this.tokenService.revokeRefreshToken(userId);

    return { message: 'Account deleted successfully' };
  }

  // ─── NOTIFICATION SETTINGS ──────────────────────────────────
  async getNotificationSettings(userId: string) {
    const settings = await this.getOrCreateSettings(userId);
    return settings.notifications;
  }

  async updateNotificationSettings(userId: string, dto: Record<string, boolean>) {
    const settings = await this.getOrCreateSettings(userId);
    settings.notifications = { ...settings.notifications, ...dto };
    await this.settingsRepo.save(settings);
    return settings.notifications;
  }

  // ─── PRIVACY SETTINGS ───────────────────────────────────────
  async getPrivacySettings(userId: string) {
    const settings = await this.getOrCreateSettings(userId);
    return settings.privacy;
  }

  async updatePrivacySettings(userId: string, dto: any) {
    const settings = await this.getOrCreateSettings(userId);
    settings.privacy = { ...settings.privacy, ...dto };
    await this.settingsRepo.save(settings);
    return settings.privacy;
  }

  // ─── COOKIE SETTINGS ────────────────────────────────────────
  async getCookieSettings(userId: string) {
    const settings = await this.getOrCreateSettings(userId);
    return settings.cookies;
  }

  async updateCookieSettings(userId: string, dto: any) {
    const settings = await this.getOrCreateSettings(userId);
    settings.cookies = { ...settings.cookies, ...dto };
    await this.settingsRepo.save(settings);
    return settings.cookies;
  }
}
