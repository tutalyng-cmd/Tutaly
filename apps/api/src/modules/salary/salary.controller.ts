import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';

@Controller('salaries')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  async createSalary(@Body() dto: CreateSalaryDto) {
    return this.salaryService.create(dto);
  }

  @Get('aggregates')
  async getAggregates(
    @Query('industry') industry?: string,
    @Query('role') role?: string,
    @Query('location') location?: string,
  ) {
    return {
      data: await this.salaryService.getAggregates(industry, role, location),
    };
  }

  @Get('roles/popular')
  async getPopularRoles(@Query('limit') limit?: string) {
    const l = parseInt(limit || '12', 10);
    return {
      data: await this.salaryService.getPopularRoles(l),
    };
  }

  @Get()
  async getSalaries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('industry') industry?: string,
    @Query('role') role?: string,
  ) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    return this.salaryService.getRecent(p, l, industry, role);
  }

  // --- NEW SALARY INSIGHTS ENGINE (V2) ---

  @Get('engine/search')
  async searchSalaryEngine(
    @Query('title') title: string,
    @Query('location') location?: string,
  ) {
    return this.salaryService.searchSalaryEngine(title, location);
  }

  @Post('engine/submit')
  async submitSalaryEngine(@Body() dto: any) {
    // In a real app we would use a proper DTO here
    return this.salaryService.submitSalaryEngine(dto);
  }

  @Get('engine/top-paying-companies')
  async getTopPayingCompanies(@Query('title') title: string) {
    if (!title) return { success: false, message: 'Job title is required' };
    return this.salaryService.getTopPayingCompanies(title);
  }
}
