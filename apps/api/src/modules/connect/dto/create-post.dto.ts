import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
  IsOptional,
  IsEnum,
  ArrayMaxSize,
  IsUrl,
} from 'class-validator';
import { PostVisibility } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}
