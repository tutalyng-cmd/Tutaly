import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request as NestRequest,
} from '@nestjs/common';
import { ConnectService } from './connect.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@Controller('connect')
@UseGuards(JwtAuthGuard)
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  @Post('posts')
  async createPost(
    @NestRequest() req: AuthenticatedRequest,
    @Body('content') content: string,
    @Body('imageUrls') imageUrls?: string[],
  ) {
    return this.connectService.createPost(req.user.sub, content, imageUrls);
  }

  @Get('feed')
  async getFeed(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.getFeed(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Post('posts/:id/like')
  async likePost(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.likePost(req.user.sub, id);
  }

  @Post('posts/:id/comments')
  async commentPost(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body('body') body: string,
  ) {
    return this.connectService.commentPost(req.user.sub, id, body);
  }

  @Get('posts/:id/comments')
  async getPostComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.getPostComments(
      id,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Post('follow/:id')
  async followUser(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.followUser(req.user.sub, id);
  }

  @Patch('follow/:id/accept')
  async acceptFollow(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.acceptFollow(req.user.sub, id);
  }

  @Patch('follow/:id/reject')
  async rejectFollow(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.rejectFollow(req.user.sub, id);
  }

  @Delete('follow/:id')
  async unfollowUser(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.unfollowUser(req.user.sub, id);
  }

  @Get('followers')
  async getFollowers(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.getFollowers(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('following')
  async getFollowing(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.getFollowing(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('follow/pending')
  async getPendingFollowRequests(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.getPendingFollowRequests(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Delete('posts/:id')
  async deletePost(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.deletePost(req.user.sub, id);
  }

  @Get('conversations')
  async getConversations(@NestRequest() req: AuthenticatedRequest) {
    return this.connectService.getConversations(req.user.sub);
  }

  @Get('discover')
  async discoverPeople(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.discoverPeople(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Post('messages/:id')
  async sendMessage(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body('body') body: string,
  ) {
    return this.connectService.sendMessage(req.user.sub, id, body);
  }

  @Get('messages/:id')
  async getMessages(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.getMessages(
      req.user.sub,
      id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('messages/:id/read')
  async markMessagesAsRead(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.markMessagesAsRead(req.user.sub, id);
  }

  @Post('posts/:id/save')
  async savePost(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.savePost(req.user.sub, id);
  }

  @Delete('posts/:id/save')
  async unsavePost(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.unsavePost(req.user.sub, id);
  }

  @Get('posts/saved')
  async getSavedPosts(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectService.getSavedPosts(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Post('posts/:id/report')
  async reportPost(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body('reason') reason: string,
  ) {
    return this.connectService.reportPost(req.user.sub, id, reason);
  }

  @Delete('posts/:postId/comments/:commentId')
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.deleteComment(req.user.sub, commentId);
  }

  @Get('posts/:id')
  async getSinglePost(@Param('id') id: string) {
    return this.connectService.getSinglePost(id);
  }

  @Get('profiles/:username')
  async getPublicProfile(
    @Param('username') username: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.connectService.getPublicProfile(username, req.user.sub);
  }
}
