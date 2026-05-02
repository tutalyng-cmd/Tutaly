import {
  IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional,
  MaxLength, MinLength, Min, IsBoolean, IsArray,
} from 'class-validator';
import { ListingType, PricingType, Currency } from '../entities/shop.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @IsEnum(ListingType)
  listingType: ListingType;

  @IsString()
  @IsNotEmpty()
  subcategoryId: string;

  @IsEnum(PricingType)
  pricingType: PricingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  priceUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsBoolean()
  priceMayVary?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsBoolean()
  isWorkRelatedConfirmed: boolean;
}
