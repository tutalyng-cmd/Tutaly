import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { Notification, Ad, LegalPage, SellerApplication } from './entities/support.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notification, Ad, LegalPage, SellerApplication])],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
