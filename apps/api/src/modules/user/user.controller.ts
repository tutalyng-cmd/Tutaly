import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request as NestRequest,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@NestRequest() req: any) {
    // Return standard token properties required by the dashboard router
    return {
      data: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
      }
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Get('seeker/profile')
  async getSeekerProfile(@NestRequest() req: any) {
    const userId = req.user.sub;
    return this.userService.getSeekerProfile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Patch('seeker/profile')
  async updateSeekerProfile(@NestRequest() req: any, @Body() dto: any) {
    const userId = req.user.sub;
    return this.userService.updateSeekerProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Post('seeker/resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @NestRequest() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    // Strict validation
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed for resumes');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    const userId = req.user.sub;
    return this.userService.uploadResume(userId, file.buffer);
  }
}

