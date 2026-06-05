import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../../job/entities/job.entity';
import { User } from '../../user/entities/user.entity';
import { EmployerProfile } from '../../user/entities/employer-profile.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class JobsModerationService {
  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(EmployerProfile)
    private readonly employerProfileRepo: Repository<EmployerProfile>,
  ) {}

  async getPendingJobs(page = 1, limit = 20) {
    const [data, total] = await this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('employer.employerProfile', 'employerProfile')
      .select([
        'job.id',
        'job.title',
        'job.description',
        'job.status',
        'job.createdAt',
        'employer.id',
        'employer.email',
        'employer.role',
        'employerProfile.id',
        'employerProfile.companyName',
      ])
      .where('job.status = :status', { status: JobStatus.PENDING_REVIEW })
      .orderBy('job.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: toPlain(data),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveJob(jobId: string): Promise<void> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['employer', 'employer.employerProfile'],
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== JobStatus.PENDING_REVIEW) {
      throw new BadRequestException('Only pending jobs can be approved');
    }

    await this.jobRepo.update({ id: jobId }, { status: JobStatus.ACTIVE });

    // TODO: Clear job cache
    // TODO: Send approval email to employer
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    await this.jobRepo.update({ id: jobId }, { status: JobStatus.REMOVED });
    // TODO: Notify employer with removal reason
  }

  async getAllJobs(
    page = 1,
    limit = 20,
    status?: JobStatus,
    employerId?: string,
    fromDate?: Date,
    toDate?: Date,
  ) {
    let query = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.employer', 'employer')
      .leftJoinAndSelect('employer.employerProfile', 'employerProfile');

    if (status) {
      query = query.where('job.status = :status', { status });
    }

    if (employerId) {
      query = query.andWhere('job.employer.id = :employerId', { employerId });
    }

    if (fromDate) {
      query = query.andWhere('job.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      query = query.andWhere('job.createdAt <= :toDate', { toDate });
    }

    const [data, total] = await query
      .orderBy('job.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: toPlain(data),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
