import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { NotificationsGateway } from './notifications.gateway';
import {
  Notification,
  Ad,
  LegalPage,
  SellerApplication,
} from './entities/support.entity';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Ad, LegalPage, SellerApplication]),
    AuthModule,
  ],
  controllers: [SupportController],
  providers: [SupportService, NotificationsGateway],
  exports: [SupportService],
})
export class SupportModule {}
