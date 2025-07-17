import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum NotificationType {
  USER = 'USER',
  COURSE = 'COURSE',
  GLOBAL = 'GLOBAL',
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  COURSEREVIEWER = 'COURSEREVIEWER',
  SUPPORT = 'SUPPORT',
  CONTENTMANAGER = 'CONTENTMANAGER',
  MARKETINGMANAGER = 'MARKETINGMANAGER',
  ALL_STAFF = 'ALL_STAFF',
}

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
    example: NotificationType.USER,
    description: 'Type of notification',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

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
  courseIds?: string[];

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'user ID if the notification is for a course',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userIds?: string[];
}

export class UpdateNotifyDto {
  title?: string;
  message?: string;
  type?: NotificationType;
  courseIds?: string[];
  userIds?: string[];
}
