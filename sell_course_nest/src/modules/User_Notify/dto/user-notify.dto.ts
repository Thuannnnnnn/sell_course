import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserNotifyDto {
  @ApiProperty({ example: 'uuid-user', description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid-notify', description: 'Notification ID' })
  @IsUUID()
  @IsNotEmpty()
  notifyId: string;

  @ApiProperty({ example: true, description: 'Is notification read?' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ example: true, description: 'Is notification sent?' })
  @IsOptional()
  @IsBoolean()
  isSent?: boolean;

  @ApiProperty({
    example: '2025-03-02T12:00:00Z',
    description: 'Read timestamp',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  readAt?: string;
}

export class UpdateUserNotifyDto {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isSent?: boolean;

  @ApiProperty({ example: '2025-03-02T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  readAt?: string;
}
