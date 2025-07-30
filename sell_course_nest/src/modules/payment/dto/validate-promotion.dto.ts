import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidatePromotionDto {
  @ApiProperty({ description: 'Promotion ID' })
  @IsNotEmpty()
  @IsUUID()
  promotionId: string;

  @ApiProperty({ description: 'Course ID' })
  @IsNotEmpty()
  @IsString()
  courseId: string;
}
