import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class CreateForumDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Forum title', example: 'How to use NestJS' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Forum text',
    example: 'This is a discussion about NestJS.',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Image file',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;
}
