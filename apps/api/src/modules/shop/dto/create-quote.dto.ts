import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateQuoteRequestDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  requirements: string;

  @IsString()
  @IsOptional()
  budgetRange?: string;

  @IsDateString()
  @IsOptional()
  deadlineRequested?: string;
}
