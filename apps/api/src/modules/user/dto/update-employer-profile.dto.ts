import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateEmployerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  companyBio?: string;
}
