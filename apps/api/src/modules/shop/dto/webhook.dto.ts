import { IsString, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Flutterwave Webhook DTOs ─────────────────────────────────────

export class FlutterwaveWebhookDataDto {
  @IsString()
  status: string;

  @IsString()
  tx_ref: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsOptional()
  meta?: Record<string, any>;
}

export class FlutterwaveWebhookPayloadDto {
  @IsString()
  event: string;

  @ValidateNested()
  @Type(() => FlutterwaveWebhookDataDto)
  data: FlutterwaveWebhookDataDto;
}

// ─── Paystack Webhook DTOs ────────────────────────────────────────

export class PaystackCustomerDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  customer_code?: string;

  @IsString()
  email: string;
}

export class PaystackAuthorizationDto {
  @IsString()
  @IsOptional()
  authorization_code?: string;

  @IsString()
  bin: string;

  @IsString()
  last4: string;

  @IsString()
  exp_month: string;

  @IsString()
  exp_year: string;

  @IsString()
  channel: string;

  @IsString()
  card_type: string;

  @IsString()
  @IsOptional()
  bank?: string;

  @IsString()
  country_code: string;

  @IsString()
  brand: string;

  @IsOptional()
  reusable?: string;

  @IsOptional()
  signature?: string;
}

export class PaystackWebhookDataDto {
  @IsNumber()
  id: number;

  @IsString()
  reference: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  status: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  gateway_response?: string;

  @IsString()
  paid_at: string;

  @IsString()
  created_at: string;

  @ValidateNested()
  @Type(() => PaystackCustomerDto)
  customer: PaystackCustomerDto;

  @ValidateNested()
  @Type(() => PaystackAuthorizationDto)
  @IsOptional()
  authorization?: PaystackAuthorizationDto;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class PaystackWebhookPayloadDto {
  @IsString()
  event: string;

  @ValidateNested()
  @Type(() => PaystackWebhookDataDto)
  data: PaystackWebhookDataDto;
}
