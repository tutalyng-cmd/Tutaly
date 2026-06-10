import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { JobModule } from './modules/job/job.module';
import { ShopModule } from './modules/shop/shop.module';
import { ConnectModule } from './modules/connect/connect.module';
import { ReviewModule } from './modules/review/review.module';
import { SalaryModule } from './modules/salary/salary.module';
import { SupportModule } from './modules/support/support.module';
import { AdminModule } from './modules/admin/admin.module';
import { AdsModule } from './modules/ads/ads.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrlStr = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        let redisConfig: any;
        
        try {
          const url = new URL(redisUrlStr);
          redisConfig = {
            host: url.hostname,
            port: parseInt(url.port, 10) || 6379,
            password: url.password ? decodeURIComponent(url.password) : undefined,
            username: url.username ? decodeURIComponent(url.username) : undefined,
            tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
            family: 4, // Force IPv4 for Upstash compatibility
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          };
        } catch (e) {
          // Fallback if URL parsing fails
          redisConfig = redisUrlStr;
        }

        return {
          redis: redisConfig,
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    JobModule,
    ShopModule,
    ConnectModule,
    ReviewModule,
    SalaryModule,
    SupportModule,
    AdminModule,
    AdsModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
