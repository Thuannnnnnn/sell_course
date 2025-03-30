import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class UpdateParticipantStatusDto {
  @ApiProperty({ description: 'Meeting ID' })
  @IsNotEmpty()
  @IsString()
  meetingId: string;

  @ApiProperty({ description: 'User ID of the participant' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Whether the participant has camera enabled' })
  @IsBoolean()
  hasCamera: boolean;

  @ApiProperty({
    description: 'Whether the participant has microphone enabled',
  })
  @IsBoolean()
  hasMicrophone: boolean;

  @ApiProperty({ description: 'Whether the participant is sharing screen' })
  @IsBoolean()
  isScreenSharing: boolean;
}
