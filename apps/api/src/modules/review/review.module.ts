import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { CompanyReview } from './entities/review.entity';
import { ReviewResponse } from './entities/review-response.entity';
import { AuthModule } from '../auth/auth.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyReview, ReviewResponse]),
    AuthModule,
    CompanyModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
