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
  Req,
} from '@nestjs/common';
import { JobService } from './job.service';
import {
  CreateJobDto,
  UpdateJobDto,
  JobQueryDto,
  ApplyJobDto,
  UpdateApplicationStatusDto,
} from './dto/job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import type { Request } from 'express';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  // ─── PUBLIC ENDPOINTS ────────────────────────────────────

  @Get()
  async findAll(@Query() query: JobQueryDto) {
    return this.jobService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  // ─── SEEKER ENDPOINTS ────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Post(':id/apply')
  async apply(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: ApplyJobDto,
  ) {
    const userId = (req as any).user.sub;
    return this.jobService.apply(id, userId, dto);
  }

  // ─── EMPLOYER ENDPOINTS ──────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post()
  async create(@Body() createJobDto: CreateJobDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.jobService.create(createJobDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('employer/me')
  async getEmployerJobs(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.jobService.findEmployerJobs(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get(':id/applicants')
  async getApplicants(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.jobService.getJobApplicants(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Patch(':id/applicants/:appId')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Param('appId') appId: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.jobService.updateApplicationStatus(appId, dto, userId);
  }

  // ─── EMPLOYER / ADMIN ENDPOINTS ──────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    const role = (req as any).user.role;
    return this.jobService.update(id, updateJobDto, userId, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    const role = (req as any).user.role;
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
