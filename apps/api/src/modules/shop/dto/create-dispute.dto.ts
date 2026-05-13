import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  evidenceUrls?: string[];
}
