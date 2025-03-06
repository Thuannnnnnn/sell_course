import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQaDto {
  @ApiProperty({ example: 'user@example.com', description: 'User Email' })
  @IsNotEmpty()
  @IsString()
  userEmail: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Course ID',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({
    example: 'What is the difference between TypeScript and JavaScript?',
    description: 'QA Text',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({
    example: '987e6543-e21b-11d3-a456-426614174001',
    description: 'Parent QA ID (for replies)',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
