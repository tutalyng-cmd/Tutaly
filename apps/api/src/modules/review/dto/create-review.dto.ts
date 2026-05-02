import { IsString, IsNotEmpty, IsNumber, Min, Max, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  companyName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sector?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  position?: string;

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
  recommend: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;
}
