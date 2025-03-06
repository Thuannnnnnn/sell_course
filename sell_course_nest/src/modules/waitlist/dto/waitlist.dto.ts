// waitlist.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateWaitlistDto {
  @ApiProperty({
    description: 'The user ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The course ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  courseId: string;

  @ApiProperty({
    description: 'Checked status',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isChecked?: boolean;
}

export class UpdateWaitlistDto {
  @ApiProperty({
    description: 'Checked status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isChecked?: boolean;
}
