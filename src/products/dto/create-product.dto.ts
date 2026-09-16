import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  path_img?: string;

  @IsString()
  @IsOptional()
  preferred_measure?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  low_stock?: number;
}
