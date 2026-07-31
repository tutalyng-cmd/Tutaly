import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AnonymityMode } from './entities/community-thread.entity';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('bowls')
  async getBowls() {
    return this.communityService.getTrendingBowls();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('feed')
  async getFeed(
    @Request() req,
    @Query('bowl') bowlSlug?: string,
    @Query('tab') tab: 'global' | 'following' = 'global',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user?.id;
    return this.communityService.getFeed(userId, {
      bowlSlug,
      tab,
      page,
      limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('threads')
  async createThread(
    @Request() req,
    @Body()
    dto: {
      bowl_slug: string;
      title: string;
      content: string;
      anonymity_mode: AnonymityMode;
      display_title_override?: string;
    },
  ) {
    return this.communityService.createThread(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('threads/:id/vote')
  async voteThread(@Param('id') threadId: string, @Request() req) {
    // Basic upvote implementation for now
    return this.communityService.upvoteThread(threadId, req.user.id);
  }
}
