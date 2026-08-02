import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
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
  @Post('threads/upload')
  @UseInterceptors(
    FilesInterceptor('files', 4, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      },
    }),
  )
  async uploadThreadMedia(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`,
        );
      }
    }

    return this.communityService.uploadThreadMedia(req.user.id, files);
  }

  @UseGuards(JwtAuthGuard)
  @Post('threads')
  async createThread(
    @Request() req,
    @Body()
    dto: {
      bowl_slug?: string;
      bowl_name?: string;
      title: string;
      content: string;
      anonymity_mode: AnonymityMode;
      display_title_override?: string;
      media_urls?: string[];
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
