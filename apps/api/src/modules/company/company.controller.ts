import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    return this.companyService.findAll(+page, +limit, search);
  }

  @Get('top')
  async getTopCompanies(@Query('limit') limit = '6') {
    return this.companyService.getTopCompanies(+limit);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.companyService.findBySlug(slug);
  }

  @Post('find-or-create')
  async findOrCreate(@Body('name') name: string) {
    return this.companyService.findOrCreate(name);
  }
}
