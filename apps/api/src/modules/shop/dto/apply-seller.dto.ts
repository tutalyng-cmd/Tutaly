import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ApplySellerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(2000)
  bio: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  categoryFocus: string;
}
