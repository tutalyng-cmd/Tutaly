import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../user/entities/user.entity';
import { SeekerProfile } from '../user/entities/seeker-profile.entity';
import { EmployerProfile } from '../user/entities/employer-profile.entity';
import { MailService } from './mail.service';
import { TokenService } from './token.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyMfaDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(SeekerProfile)
    private seekerProfileRepo: Repository<SeekerProfile>,
    @InjectRepository(EmployerProfile)
    private employerProfileRepo: Repository<EmployerProfile>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private tokenService: TokenService,
  ) {}

  // ─── REGISTER ──────────────────────────────────────
  async register(dto: RegisterDto) {
    try {
      console.log('[Auth] Register attempt:', {
        email: dto.email,
        role: dto.role,
      });

      // 1. Age 18+ check
      const dob = new Date(dto.dateOfBirth);
      const age = Math.floor(
        (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      );
      if (age < 18) {
        throw new BadRequestException(
          'You must be at least 18 years old to register.',
        );
      }

      // 2. Check duplicate email
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 12);

      // 4. Create user
      const user = this.userRepo.create({
        email: dto.email,
        password: hashedPassword,
        role: dto.role === 'admin' ? UserRole.SEEKER : dto.role, // prevent admin registration
        dateOfBirth: dob,
        tosAgreedAt: new Date(),
        isMfaEnabled: dto.role === UserRole.EMPLOYER, // Mandatory for employers
      });
      await this.userRepo.save(user);

      // 5. Create role-specific profile
      if (dto.role === UserRole.SEEKER) {
        const profile = this.seekerProfileRepo.create({
          user,
          firstName: dto.firstName,
          lastName: dto.lastName,
        });
        await this.seekerProfileRepo.save(profile);
      } else if (dto.role === UserRole.EMPLOYER) {
        const profile = this.employerProfileRepo.create({
          user,
          companyName: dto.companyName || 'My Company',
          industry: dto.industry,
        });
        await this.employerProfileRepo.save(profile);
      }

      // 6. Generate verification token and send email
      const verifyToken = this.generateVerificationToken(user.id);
      await this.mailService.sendVerificationEmail(user.email, verifyToken);

      return {
        message:
          'Registration successful. Please check your email to verify your account.',
        userId: user.id,
      };
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      // Re-throw to allow NestJS to handle standard exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'Registration failed unexpectedly',
      );
    }
  }

  // ─── LOGIN ──────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'isEmailVerified',
        'isActive',
        'isMfaEnabled',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // MFA FLOW
    if (user.isMfaEnabled) {
      const otp = await this.tokenService.generateMfaEntry(user.id);
      const mfaToken = crypto.randomBytes(32).toString('hex');
      await this.tokenService.storeMfaSession(user.id, mfaToken);

      await this.mailService.sendMfaEmail(user.email, otp);

      return {
        mfaRequired: true,
        userId: user.id,
        mfaToken,
        message: 'OTP sent to your email. Please verify to continue.',
      };
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in Redis
    await this.tokenService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // ─── VERIFY MFA ─────────────────────────────────────
  async verifyMfa(dto: VerifyMfaDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
      select: ['id', 'email', 'role', 'isEmailVerified', 'isActive'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user.');
    }

    // 1. Validate temporary MFA session
    const isSessionValid = await this.tokenService.validateMfaSession(
      user.id,
      dto.mfaToken,
    );
    if (!isSessionValid) {
      throw new UnauthorizedException(
        'MFA session expired or invalid. Please login again.',
      );
    }

    // 2. Validate OTP
    const isOtpValid = await this.tokenService.validateMfaOtp(
      user.id,
      dto.code,
    );
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP code.');
    }

    // 3. Issue final tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.tokenService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // ─── VERIFY EMAIL ──────────────────────────────────
  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new BadRequestException('Invalid verification token.');
      }

      if (user.isEmailVerified) {
        return { message: 'Email is already verified.' };
      }

      user.isEmailVerified = true;
      await this.userRepo.save(user);

      return { message: 'Email verified successfully. You can now log in.' };
    } catch {
      throw new BadRequestException('Invalid or expired verification token.');
    }
  }

  // ─── REFRESH TOKEN ─────────────────────────────────
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      // Check against Redis
      const isValid = await this.tokenService.validateRefreshToken(
        user.id,
        refreshToken,
      );
      if (!isValid) {
        throw new UnauthorizedException('Refresh token is revoked or invalid.');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Rotate token in Redis
      await this.tokenService.storeRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  // ─── LOGOUT ───────────────────────────────────────
  async logout(userId: string) {
    await this.tokenService.revokeRefreshToken(userId);
  }

  // ─── FORGOT PASSWORD ───────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message:
          'If an account exists with that email, a reset link has been sent.',
      };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'If an account exists with that email, a reset link has been sent.',
    };
  }

  // ─── RESET PASSWORD ────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Invalid reset token.');
      }

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new BadRequestException('Invalid reset token.');
      }

      user.password = await bcrypt.hash(dto.newPassword, 12);
      await this.userRepo.save(user);

      return { message: 'Password reset successfully. You can now log in.' };
    } catch {
      throw new BadRequestException('Invalid or expired reset token.');
    }
  }

  // ─── HELPERS ────────────────────────────────────────
  private generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  private generateVerificationToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'email-verify' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '24h',
      },
    );
  }
}
