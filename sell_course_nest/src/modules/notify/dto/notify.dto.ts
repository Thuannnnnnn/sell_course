import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNotifyDto {
  @ApiProperty({
    example: 'New Course Available',
    description: 'Title of the notification',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'A new course has been added to the platform.',
    description: 'Message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'USER',
    description: 'Type of notification',
    enum: ['USER', 'COURSE', 'GLOBAL'],
  })
  @IsEnum(['USER', 'COURSE', 'GLOBAL'])
  type: 'USER' | 'COURSE' | 'GLOBAL';

  @ApiProperty({
    example: false,
    description: 'Indicates if this is a global notification',
  })
  @IsOptional()
  isGlobal?: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Course ID if the notification is for a course',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'user ID if the notification is for a course',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateNotifyDto {
  @ApiProperty({ example: 'Updated Notification Title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated notification message.', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: 'USER',
    enum: ['USER', 'COURSE', 'GLOBAL'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['USER', 'COURSE', 'GLOBAL'])
  type?: 'USER' | 'COURSE' | 'GLOBAL';

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  isGlobal?: boolean;
}
