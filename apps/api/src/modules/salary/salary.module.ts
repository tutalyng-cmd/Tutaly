import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { SalaryReview } from '../review/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalaryReview])],
  controllers: [SalaryController],
  providers: [SalaryService],
})
export class SalaryModule {}
