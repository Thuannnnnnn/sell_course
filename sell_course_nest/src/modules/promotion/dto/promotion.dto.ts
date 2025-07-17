// promotion.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promotion name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Discount percentage' })
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @ApiProperty({ description: 'Promotion code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Course ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdatePromotionDto {
  @ApiProperty({ description: 'Promotion name', required: false })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Discount percentage', required: false })
  @IsNumber()
  discount?: number;

  @ApiProperty({ description: 'Promotion code', required: false })
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Course ID', required: false })
  @IsString()
  courseId?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
