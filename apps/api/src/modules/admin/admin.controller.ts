import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getUsers(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }
    return this.adminService.updateUserStatus(id, isActive);
  }

  @Get('jobs/pending')
  async getPendingJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('jobs')
  async getAllJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
    );
  }

  @Get('sellers')
  async getAllSellerApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllSellerApplications(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
    );
  }

  @Get('orders/flagged')
  async getFlaggedOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getFlaggedOrders(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('orders/:id/resolve')
  async resolveFlaggedOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('resolution') resolution: 'completed' | 'refunded',
    @Body('adminNotes') adminNotes?: string,
  ) {
    if (!['completed', 'refunded'].includes(resolution)) {
      throw new BadRequestException('Resolution must be completed or refunded');
    }
    return this.adminService.resolveFlaggedOrder(id, resolution, adminNotes);
  }
}
