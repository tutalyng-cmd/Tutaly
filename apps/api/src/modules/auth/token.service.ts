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
}
