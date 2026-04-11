import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Job, Application, SavedJob, ReportedJob } from './entities/job.entity';
import { User } from '../user/entities/user.entity';
import { SeekerProfile } from '../user/entities/seeker-profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Application, SavedJob, ReportedJob, User, SeekerProfile]),
    AuthModule,
  ],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
