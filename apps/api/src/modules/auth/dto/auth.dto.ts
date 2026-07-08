import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  MinLength,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  newPassword: string;
}

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  code: string;

  @IsString()
  @IsNotEmpty()
  mfaToken: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  newPassword: string;
}

export class DeleteAccountDto {
  @IsNotEmpty()
  password: string;
}
