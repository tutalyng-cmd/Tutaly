import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Job, Application, SavedJob, ReportedJob } from './entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Application, SavedJob, ReportedJob])],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
