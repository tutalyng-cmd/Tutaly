import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { SalaryPeriod } from '../../review/entities/review.entity';

export class CreateSalaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  industry: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  company?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  role: string;

  @IsNumber()
  @Min(0)
  salaryAmount: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsEnum(SalaryPeriod)
  salaryPeriod: SalaryPeriod;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsNumber()
  submissionYear: number;
}
