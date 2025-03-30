import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Meeting ID' })
  @IsNotEmpty()
  @IsString()
  meetingId: string;

  @ApiProperty({ description: 'User ID of the sender' })
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Whether the message is private',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiProperty({
    description: 'User ID of the receiver (for private messages)',
    required: false,
  })
  @IsOptional()
  @IsString()
  receiverId?: string;
}
