import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request as NestRequest,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JobService } from './job.service';
import {
  UpdateJobDto,
  JobQueryDto,
  ApplyJobDto,
  UpdateApplicationStatusDto,
  ReportJobDto,
} from './dto/job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import type { AuthenticatedRequest } from '../../common/types/request';
import { AdsService } from '../ads/services/ads.service';
import { AdGoal, AdFormat } from '../ads/enums/ads.enums';

@Controller('jobs')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly adsService: AdsService,
  ) {}

  // ─── PUBLIC ENDPOINTS ────────────────────────────────────

  @Get()
  async findAll(@Query() query: JobQueryDto) {
    return this.jobService.findAll(query);
  }

  @Get('meta/filters')
  async getFilterMetadata() {
    return this.jobService.getFilterMetadata();
  }

  // ─── SPECIFIC ROUTES (must come BEFORE :id) ──────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('employer/me')
  async getEmployerJobs(@NestRequest() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.jobService.findEmployerJobs(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('employer/stats')
  async getEmployerStats(@NestRequest() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.jobService.getEmployerDashboardStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedJobs(@NestRequest() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.jobService.getSavedJobs(userId);
  }

  // ─── PARAMETERIZED ROUTES ────────────────────────────────

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobService.findOne(id);
  }

  // ─── SEEKER ENDPOINTS ────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Get('seeker/applications')
  async getSeekerApplications(@NestRequest() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.jobService.getSeekerApplications(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Post(':id/apply')
  async apply(
    @Param('id', ParseUUIDPipe) id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: ApplyJobDto,
  ) {
    const userId = req.user.sub;
    return this.jobService.apply(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async saveJob(
    @Param('id', ParseUUIDPipe) id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.saveJob(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/save')
  async unsaveJob(
    @Param('id', ParseUUIDPipe) id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.unsaveJob(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  async reportJob(
    @Param('id', ParseUUIDPipe) id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: ReportJobDto,
  ) {
    const userId = req.user.sub;
    return this.jobService.reportJob(id, userId, dto);
  }

  // ─── EMPLOYER ENDPOINTS ──────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post()
  async create(@Body() body: any, @NestRequest() req: AuthenticatedRequest) {
    const { paymentGateway, ...createJobDto } = body;
    const userId = req.user.sub;

    // Create the job
    const job = await this.jobService.create(createJobDto, userId);

    // If it's featured or urgent, automatically create an AdCampaign and initialize payment
    let paymentInitialization: any = null;

    if (createJobDto.isFeatured || createJobDto.isUrgent) {
      // Create campaign
      const campaign = await this.adsService.createCampaign(userId, {
        job_id: job.id,
        goal: AdGoal.PROMOTE_JOB,
        format: AdFormat.SPONSORED_JOB,
        destination_url: `/jobs/${job.id}`,
        placements: ['featured_jobs', 'homepage_hero'],
        starts_at: new Date(),
        run_continuously: true,
        // Calculate budget based on features
        daily_budget: 1000,
        total_budget:
          (createJobDto.isFeatured ? 5000 : 0) +
          (createJobDto.isUrgent ? 3000 : 0),
        currency: 'NGN',
      });

      if (paymentGateway && campaign.total_budget > 0) {
        paymentInitialization = await this.adsService.initializeAdPayment(
          campaign.id,
          paymentGateway,
          req.user.email || 'employer@tutaly.com',
          req.user.email || 'Tutaly Employer',
        );
      }
    }

    return {
      message: 'Job created successfully',
      job,
      payment: paymentInitialization,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get(':id/applicants')
  async getApplicants(
    @Param('id', ParseUUIDPipe) id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.getJobApplicants(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Patch(':id/applicants/:appId')
  async updateApplicationStatus(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body() dto: UpdateApplicationStatusDto,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.updateApplicationStatus(appId, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get(':id/applicants/:appId')
  async getApplicationDetail(
    @Param('id', ParseUUIDPipe) jobId: string,
    @Param('appId', ParseUUIDPipe) appId: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.getApplicationDetail(appId, jobId, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get(':id/applicants/:appId/resume')
  async getApplicantResume(
    @Param('id', ParseUUIDPipe) jobId: string,
    @Param('appId', ParseUUIDPipe) appId: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.getApplicantResumeUrl(jobId, appId, userId);
  }

  // ─── EMPLOYER / ADMIN ENDPOINTS ──────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobDto: UpdateJobDto,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.jobService.update(id, updateJobDto, userId, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.jobService.remove(id, userId, role);
  }

  // ─── ADMIN ENDPOINTS ─────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobService.approveJob(id);
  }
}
