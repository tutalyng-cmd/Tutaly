import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { QuoteStatus } from '../entities/order.entity';

export class RespondQuoteDto {
  @IsEnum([QuoteStatus.QUOTED, QuoteStatus.REJECTED])
  status: QuoteStatus.QUOTED | QuoteStatus.REJECTED;

  @IsNumber()
  @IsOptional()
  quotedPrice?: number;

  @IsString()
  @IsOptional()
  sellerNotes?: string;

  @IsNumber()
  @IsOptional()
  expiresInDays?: number;
}
