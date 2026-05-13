import { Controller, Get, Patch, Param, Query, UseGuards, Request as NestRequest } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supportService.getNotifications(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.supportService.markAsRead(req.user.sub, id);
  }

  @Patch('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@NestRequest() req: AuthenticatedRequest) {
    return this.supportService.markAllAsRead(req.user.sub);
  }
}
