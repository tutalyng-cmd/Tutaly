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
    return { data: await this.salaryService.getAggregates(industry, role, location) };
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
}

