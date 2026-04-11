import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenService {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {
    this.redisClient = new Redis(this.configService.get<string>('REDIS_URL')!);
  }

  /**
   * Stores a refresh token in Redis associated with the user ID.
   * If a previous token exists, it can be deleted to support token rotation.
   */
  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    // Store for 7 days (604800 seconds)
    await this.redisClient.set(key, token, 'EX', 7 * 24 * 60 * 60);
  }

  /**
   * Validates a refresh token against the one stored in Redis.
   */
  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const key = `refresh_token:${userId}`;
    const storedToken = await this.redisClient.get(key);
    return storedToken === token;
  }

  /**
   * Revokes the refresh token (logout / global force logout).
   */
  async revokeRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redisClient.del(key);
  }

  /**
   * Generates and stores a 6-digit OTP for MFA.
   */
  async generateMfaEntry(userId: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `mfa_otp:${userId}`;
    // Store for 5 minutes
    await this.redisClient.set(key, otp, 'EX', 5 * 60);
    return otp;
  }

  /**
   * Validates the MFA OTP.
   */
  async validateMfaOtp(userId: string, otp: string): Promise<boolean> {
    const key = `mfa_otp:${userId}`;
    const storedOtp = await this.redisClient.get(key);
    if (storedOtp === otp) {
      await this.redisClient.del(key);
      return true;
    }
    return false;
  }

  /**
   * Stores a temporary MFA session token (to prove the user just logged in).
   */
  async storeMfaSession(userId: string, token: string): Promise<void> {
    const key = `mfa_session:${userId}`;
    // Store for 10 minutes
    await this.redisClient.set(key, token, 'EX', 10 * 60);
  }

  /**
   * Validates the temporary MFA session token.
   */
  async validateMfaSession(userId: string, token: string): Promise<boolean> {
    const key = `mfa_session:${userId}`;
    const storedToken = await this.redisClient.get(key);
    return storedToken === token;
  }

  // ─── JOB CACHING ──────────────────────────────────
  async getJobCache(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async setJobCache(key: string, data: string, ttlSeconds: number = 300): Promise<void> {
    await this.redisClient.set(key, data, 'EX', ttlSeconds);
  }

  async invalidateJobCache(): Promise<void> {
    const keys = await this.redisClient.keys('jobs:*');
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}
