import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  jobTitle: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  jobLocation?: string;

  @IsBoolean()
  isCurrentEmployee: boolean;

  @IsOptional()
  @IsNumber()
  employmentEndYear?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reviewTitle: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  ratingOverall: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingWorkLife?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingPay?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingManagement?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingCulture?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  pros: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  cons: string;

  @IsBoolean()
  @IsOptional()
  recommend?: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;
}
