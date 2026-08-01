import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Query,
  Res,
  Req,
  UseGuards,
  Request as NestRequest,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyMfaDto,
  ChangePasswordDto,
  DeleteAccountDto,
  OnboardingDto,
} from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '../user/entities/user.entity';

interface AuthorizedRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: UserRole;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ short: { limit: 2, ttl: 60000 } }) // Extra strict for registration
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('signin')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Limit login attempts
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    // Only set refresh token cookie if it was issued (non-MFA flow)
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
    }

    // Return the entire result (includes mfaRequired, userId, mfaToken if applicable)
    return result;
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('verify-mfa')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async verifyMfa(
    @Body() dto: VerifyMfaDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyMfa(dto);

    // Set refresh token as HttpOnly cookie (7 days)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided.' });
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // Rotate refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken: result.accessToken };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  async setupMfa(@Req() req: AuthorizedRequest) {
    return this.authService.setupMfa(req.user.sub, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  async enableMfa(@Req() req: AuthorizedRequest, @Body() dto: VerifyMfaDto) {
    // Note: VerifyMfaDto requires userId, but since they are authenticated, we can override or just use req.user.sub
    // For simplicity, we just pass the DTO and ignore its userId if we want, but VerifyMfaDto requires userId.
    // Let's ensure the userId in DTO matches the authenticated user, or just trust the authenticated user.
    return this.authService.enableMfa(req.user.sub, { ...dto, userId: req.user.sub });
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  async disableMfa(@Req() req: AuthorizedRequest) {
    return this.authService.disableMfa(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @NestRequest() req: AuthorizedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user?.sub) {
      await this.authService.logout(req.user.sub);
    }
    res.clearCookie('refreshToken', {
      path: '/',
      secure: true,
      sameSite: 'none' as const,
    });
    return { message: 'Logged out successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @NestRequest() req: AuthorizedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(
    @NestRequest() req: AuthorizedRequest,
    @Body() dto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.deleteAccount(req.user.sub, dto);

    // Clear cookies upon deletion
    res.clearCookie('refreshToken', {
      path: '/',
      secure: true,
      sameSite: 'none' as const,
    });

    return result;
  }

  // ─── OAUTH ──────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ) {
    const user = await this.authService.validateOAuthUser(req.user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Store refresh token
    await (this.authService as any).tokenService.storeRefreshToken(
      user.id,
      refreshToken,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const webUrl = this.configService.get('WEB_URL') || 'http://localhost:3000';
    res.redirect(`${webUrl}/auth/oauth-success`);
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuth() {
    // Initiates LinkedIn OAuth
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthRedirect(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ) {
    const user = await this.authService.validateOAuthUser(req.user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Store refresh token
    await (this.authService as any).tokenService.storeRefreshToken(
      user.id,
      refreshToken,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const webUrl = this.configService.get('WEB_URL') || 'http://localhost:3000';
    res.redirect(`${webUrl}/auth/oauth-success`);
  }

  @UseGuards(JwtAuthGuard)
  @Put('onboarding')
  async completeOnboarding(
    @NestRequest() req: AuthorizedRequest,
    @Body() dto: OnboardingDto,
  ) {
    return this.authService.completeOnboarding(req.user.sub, dto);
  }
}
