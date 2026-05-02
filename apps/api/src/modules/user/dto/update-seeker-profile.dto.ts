import { IsOptional, IsString, IsArray, MaxLength } from 'class-validator';

export class UpdateSeekerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  socialLinks?: { linkedin?: string; portfolio?: string };
}
