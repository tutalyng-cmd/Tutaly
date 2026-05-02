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
import { UpdateSeekerProfileDto } from './dto/update-seeker-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@NestRequest() req: AuthenticatedRequest) {
    // Return standard token properties required by the dashboard router
    return {
      data: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Get('seeker/profile')
  async getSeekerProfile(@NestRequest() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.userService.getSeekerProfile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Patch('seeker/profile')
  async updateSeekerProfile(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: UpdateSeekerProfileDto,
  ) {
    const userId = req.user.sub;
    return this.userService.updateSeekerProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Post('seeker/resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @NestRequest() req: AuthenticatedRequest,
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER)
  @Post('seeker/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @NestRequest() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed for avatars');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size must not exceed 2MB');
    }

    const userId = req.user.sub;
    return this.userService.uploadAvatar(userId, file.buffer, file.mimetype);
  }

  // --- Employer Endpoints ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('employer/profile')
  async getEmployerProfile(@NestRequest() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.userService.getEmployerProfile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Patch('employer/profile')
  async updateEmployerProfile(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    const userId = req.user.sub;
    return this.userService.updateEmployerProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post('employer/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @NestRequest() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed for logos');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size must not exceed 2MB');
    }

    const userId = req.user.sub;
    return this.userService.uploadLogo(userId, file.buffer, file.mimetype);
  }
}
