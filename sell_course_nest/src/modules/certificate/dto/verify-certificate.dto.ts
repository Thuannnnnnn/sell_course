import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCertificateDto {
  @ApiProperty({
    description: 'Certificate ID to verify',
    example: 'CERT-123456',
  })
  @IsNotEmpty()
  @IsString()
  certificateId: string;
}
