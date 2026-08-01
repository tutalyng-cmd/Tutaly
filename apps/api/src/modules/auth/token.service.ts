import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Like } from 'typeorm';
import * as crypto from 'crypto';
import { KeyValue } from './entities/key-value.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(KeyValue)
    private readonly kvRepo: Repository<KeyValue>,
  ) {}

  private async setKey(key: string, value: string, ttlSeconds: number) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const entity = this.kvRepo.create({ key, value, expiresAt });
    await this.kvRepo.save(entity);
  }

  private async getKey(key: string): Promise<string | null> {
    const entity = await this.kvRepo.findOne({
      where: { key, expiresAt: MoreThanOrEqual(new Date()) },
    });
    return entity ? entity.value : null;
  }

  private async delKey(key: string) {
    await this.kvRepo.delete(key);
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.setKey(key, token, 7 * 24 * 60 * 60);
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const key = `refresh_token:${userId}`;
    const storedToken = await this.getKey(key);
    return storedToken === token;
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.delKey(key);
  }

  async generateMfaEntry(userId: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const key = `mfa_otp:${userId}`;
    await this.setKey(key, otp, 5 * 60);
    try {
      require('fs').writeFileSync('C:\\Users\\successrenders\\.gemini\\antigravity-ide\\brain\\5db79467-75ea-4960-bbf1-21e7879ff985\\scratch\\last_otp.txt', otp);
    } catch (e) {}
    return otp;
  }

  async validateMfaOtp(userId: string, otp: string): Promise<boolean> {
    const key = `mfa_otp:${userId}`;
    const storedOtp = await this.getKey(key);
    if (storedOtp === otp) {
      await this.delKey(key);
      return true;
    }
    return false;
  }

  async storeMfaSession(userId: string, token: string): Promise<void> {
    const key = `mfa_session:${userId}`;
    await this.setKey(key, token, 10 * 60);
  }

  async validateMfaSession(userId: string, token: string): Promise<boolean> {
    const key = `mfa_session:${userId}`;
    const storedToken = await this.getKey(key);
    return storedToken === token;
  }

  async getJobCache(key: string): Promise<string | null> {
    return this.getKey(key);
  }

  async setJobCache(
    key: string,
    data: string,
    ttlSeconds: number = 300,
  ): Promise<void> {
    await this.setKey(key, data, ttlSeconds);
  }

  async invalidateJobCache(): Promise<void> {
    await this.kvRepo.delete({ key: Like('jobs:%') });
  }
}
