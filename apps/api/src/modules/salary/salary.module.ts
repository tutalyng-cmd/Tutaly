import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { Salary } from './entities/salary.entity';
import { SalaryAggregate } from './entities/salary-aggregate.entity';
import { SalaryReview } from '../review/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salary, SalaryAggregate, SalaryReview])],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
