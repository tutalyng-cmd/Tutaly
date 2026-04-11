import { IsEmail, IsEnum, IsNotEmpty, IsDateString, MinLength, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(UserRole, { message: 'Role must be seeker or employer' })
  role: UserRole;

  @IsDateString()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsString()
  recaptchaToken: string;

  // Seeker fields (optional)
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  // Employer fields (optional)
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  token: string;

  @MinLength(8)
  newPassword: string;
}
