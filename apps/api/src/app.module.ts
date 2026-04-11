import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
