import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Job, Application, SavedJob, JobStatus, ApplicationStatus } from './entities/job.entity';
import { CreateJobDto, UpdateJobDto, JobQueryDto, ApplyJobDto, UpdateApplicationStatusDto } from './dto/job.dto';
import { TokenService } from '../auth/token.service';
import { MailService } from '../auth/mail.service';
import { User, UserRole } from '../user/entities/user.entity';
import { SeekerProfile } from '../user/entities/seeker-profile.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(SavedJob)
    private readonly savedJobRepo: Repository<SavedJob>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepo: Repository<SeekerProfile>,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateJobDto, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Employer not found');

    const job = this.jobRepo.create({
      ...dto,
      employer: user,
      status: JobStatus.PENDING_REVIEW, // Enforce pending status
    });

    await this.jobRepo.save(job);
    return job;
  }

  async findAll(query: JobQueryDto) {
    const {
      keyword,
      country,
      state,
      area,
      industry,
      role,
      jobType,
      experienceLevel,
      workMode,
      minSalary,
      maxSalary,
      status = JobStatus.ACTIVE, // By default, only show ACTIVE jobs to public
      isFeatured,
      page = 1,
      limit = 20,
    } = query;

    // Check Cache first if it's a standard public query (no keyword/deep filters, just page 1)
    const cacheKey = `jobs:public:${JSON.stringify(query)}`;
    if (status === JobStatus.ACTIVE) {
      const cached = await this.tokenService.getJobCache(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const qb = this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.employer', 'employer')
      .where('job.status = :status', { status });

    if (country) qb.andWhere('job.country ILIKE :country', { country });
    if (state) qb.andWhere('job.state ILIKE :state', { state });
    if (area) qb.andWhere('job.area ILIKE :area', { area });
    
    if (industry) qb.andWhere('job.industry = :industry', { industry });
    if (role) qb.andWhere('job.role = :role', { role });
    if (jobType) qb.andWhere('job.jobType = :jobType', { jobType });
    if (experienceLevel) qb.andWhere('job.experienceLevel = :experienceLevel', { experienceLevel });
    if (workMode) qb.andWhere('job.workMode = :workMode', { workMode });
    if (isFeatured !== undefined) qb.andWhere('job.isFeatured = :isFeatured', { isFeatured });

    if (minSalary) qb.andWhere('job.minSalary >= :minSalary', { minSalary });
    if (maxSalary) qb.andWhere('job.maxSalary <= :maxSalary', { maxSalary });

    if (keyword) {
      // Use the raw search_vector from DB
      qb.andWhere(
        "job.search_vector @@ plainto_tsquery('english', :keyword)",
        { keyword }
      );
      // Order by rank
      qb.orderBy("ts_rank(job.search_vector, plainto_tsquery('english', :keyword))", "DESC");
    } else {
      qb.orderBy('job.createdAt', 'DESC');
    }

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const result = {
      items: items.map(this.sanitizeJob),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    if (status === JobStatus.ACTIVE) {
      await this.tokenService.setJobCache(cacheKey, JSON.stringify(result), 300); // 5 mins
    }

    return result;
  }

  async findEmployerJobs(employerId: string) {
    const jobs = await this.jobRepo.find({
      where: { employer: { id: employerId } },
      order: { createdAt: 'DESC' },
    });
    return jobs.map((job) => this.sanitizeJob(job));
  }

  async findOne(id: string) {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['employer'],
    });

    if (!job) throw new NotFoundException('Job not found');
    return this.sanitizeJob(job);
  }

  async update(id: string, dto: UpdateJobDto, userId: string, role: string) {
    const job = await this.jobRepo.findOne({ where: { id }, relations: ['employer'] });
    if (!job) throw new NotFoundException('Job not found');

    if (role !== UserRole.ADMIN && job.employer?.id !== userId) {
      throw new ForbiddenException('You can only update your own jobs.');
    }

    Object.assign(job, dto);
    
    // If employer updates a job, it should go back to pending review (security measure)
    if (role === UserRole.EMPLOYER) {
      job.status = JobStatus.PENDING_REVIEW;
      await this.tokenService.invalidateJobCache();
    }

    await this.jobRepo.save(job);
    return this.sanitizeJob(job);
  }

  async remove(id: string, userId: string, role: string) {
    const job = await this.jobRepo.findOne({ where: { id }, relations: ['employer'] });
    if (!job) throw new NotFoundException('Job not found');

    if (role !== UserRole.ADMIN && job.employer?.id !== userId) {
      throw new ForbiddenException('You can only delete your own jobs.');
    }

    await this.jobRepo.remove(job);
    await this.tokenService.invalidateJobCache();
    return { success: true };
  }

  // ─── ADMIN APPROVAL ──────────────────────────────────────
  async approveJob(id: string) {
    const job = await this.jobRepo.findOne({ where: { id }, relations: ['employer'] });
    if (!job) throw new NotFoundException('Job not found');

    job.status = JobStatus.ACTIVE;
    await this.jobRepo.save(job);

    // 1. Invalidate cache globally so it appears instantly
    await this.tokenService.invalidateJobCache();

    // 2. Notify employer via email
    if (job.employer && job.employer.email) {
      await this.mailService.sendJobApprovedEmail(job.employer.email, job.title, job.id);
    }

    return this.sanitizeJob(job);
  }

  // ─── APPLICATIONS ────────────────────────────────────────
  async apply(jobId: string, userId: string, dto: ApplyJobDto) {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job || job.status !== JobStatus.ACTIVE) {
      throw new NotFoundException('Job is not available for applying');
    }

    const seeker = await this.userRepo.findOne({ where: { id: userId } });
    if (!seeker) throw new NotFoundException('User not found');

    const profile = await this.seekerProfileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile || !profile.resumeUrl) {
      throw new BadRequestException('You must upload a CV to your profile before applying to jobs.');
    }

    const existingApplication = await this.applicationRepo.findOne({
      where: { job: { id: jobId }, seeker: { id: userId } },
    });
    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job.');
    }

    const application = this.applicationRepo.create({
      job,
      seeker,
      coverNote: dto.coverNote,
      status: ApplicationStatus.APPLIED,
    });

    await this.applicationRepo.save(application);
    return application;
  }

  async getJobApplicants(jobId: string, employerId: string) {
    const job = await this.jobRepo.findOne({ where: { id: jobId }, relations: ['employer'] });
    if (!job || job.employer?.id !== employerId) {
      throw new ForbiddenException('You can only view applicants for your own jobs.');
    }

    // Including seeker profile and user data
    return this.applicationRepo.find({
      where: { job: { id: jobId } },
      relations: ['seeker', 'seeker.seekerProfile'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateApplicationStatus(appId: string, dto: UpdateApplicationStatusDto, employerId: string) {
    const application = await this.applicationRepo.findOne({
      where: { id: appId },
      relations: ['job', 'job.employer']
    });

    if (!application || application.job?.employer?.id !== employerId) {
      throw new ForbiddenException('Invalid application or you do not have permission.');
    }

    application.status = dto.status;
    await this.applicationRepo.save(application);
    return application;
  }

  // ─── UTILS ───────────────────────────────────────────────
  
  // Sanitizes job response to avoid leaking employer sensitive info like password hashes
  private sanitizeJob(job: Job) {
    const { employer, ...jobData } = job;
    return {
      ...jobData,
      employer: employer ? { id: employer.id, email: employer.email } : null,
    };
  }
}
