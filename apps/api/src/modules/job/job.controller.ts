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
} from '@nestjs/common';
import { JobService } from './job.service';
import {
  CreateJobDto,
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
import type { Request } from 'express';

interface AuthorizedRequest extends Request {
  user: {
    sub: string;
    role: UserRole;
  };
}

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  // ─── PUBLIC ENDPOINTS ────────────────────────────────────

  @Get()
  async findAll(@Query() query: JobQueryDto) {
    return this.jobService.findAll(query);
  }

  // ─── SPECIFIC ROUTES (must come BEFORE :id) ──────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('employer/me')
  async getEmployerJobs(@NestRequest() req: AuthorizedRequest) {
    const userId = req.user.sub;
    return this.jobService.findEmployerJobs(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedJobs(@NestRequest() req: AuthorizedRequest) {
    const userId = req.user.sub;
    return this.jobService.getSavedJobs(userId);
  }

  // ─── PARAMETERIZED ROUTES ────────────────────────────────

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  // ─── SEEKER ENDPOINTS ────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Get('seeker/applications')
  async getSeekerApplications(@NestRequest() req: AuthorizedRequest) {
    const userId = req.user.sub;
    return this.jobService.getSeekerApplications(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Post(':id/apply')
  async apply(
    @Param('id') id: string,
    @NestRequest() req: AuthorizedRequest,
    @Body() dto: ApplyJobDto,
  ) {
    const userId = req.user.sub;
    return this.jobService.apply(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async saveJob(
    @Param('id') id: string,
    @NestRequest() req: AuthorizedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.saveJob(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/save')
  async unsaveJob(
    @Param('id') id: string,
    @NestRequest() req: AuthorizedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.unsaveJob(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  async reportJob(
    @Param('id') id: string,
    @NestRequest() req: AuthorizedRequest,
    @Body() dto: ReportJobDto,
  ) {
    const userId = req.user.sub;
    return this.jobService.reportJob(id, userId, dto);
  }

  // ─── EMPLOYER ENDPOINTS ──────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post()
  async create(
    @Body() createJobDto: CreateJobDto,
    @NestRequest() req: AuthorizedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.create(createJobDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get(':id/applicants')
  async getApplicants(
    @Param('id') id: string,
    @NestRequest() req: AuthorizedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.getJobApplicants(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Patch(':id/applicants/:appId')
  async updateApplicationStatus(
    @Param('appId') appId: string,
    @Body() dto: UpdateApplicationStatusDto,
    @NestRequest() req: AuthorizedRequest,
  ) {
    const userId = req.user.sub;
    return this.jobService.updateApplicationStatus(appId, dto, userId);
  }

  // ─── EMPLOYER / ADMIN ENDPOINTS ──────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @NestRequest() req: AuthorizedRequest,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.jobService.update(id, updateJobDto, userId, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @NestRequest() req: AuthorizedRequest) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.jobService.remove(id, userId, role);
  }

  // ─── ADMIN ENDPOINTS ─────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.jobService.approveJob(id);
  }
}
