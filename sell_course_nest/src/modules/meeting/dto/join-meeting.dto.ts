import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class JoinMeetingDto {
  @ApiProperty({ description: 'Meeting ID or code to join' })
  @IsNotEmpty()
  @IsString()
  meetingId: string;

  @ApiProperty({
    description: 'User ID of the participant joining the meeting',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Whether the participant has camera enabled',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasCamera?: boolean;

  @ApiProperty({
    description: 'Whether the participant has microphone enabled',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasMicrophone?: boolean;
}
