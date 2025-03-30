import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({ description: 'Title of the meeting' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the meeting', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'User ID of the meeting host' })
  @IsNotEmpty()
  @IsString()
  hostId: string;

  @ApiProperty({
    description: 'Whether the meeting is scheduled for a future time',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @ApiProperty({
    description: 'Scheduled time for the meeting',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledTime?: Date;

  @ApiProperty({
    description: 'Whether the meeting should be recorded',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecorded?: boolean;
}
