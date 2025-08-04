import { ApiProperty } from '@nestjs/swagger';

export class CertificateVerificationResponseDto {
  @ApiProperty({
    description: 'Verification success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Certificate information if found',
    required: false,
  })
  certificate?: {
    certificateId: string;
    courseName: string;
    studentName: string;
    studentEmail: string;
    instructorName: string;
    issueDate: string;
    completionDate: string;
    score?: number;
    grade?: string;
    isValid: boolean;
    isRevoked: boolean;
    verificationHash: string;
    metadata?: {
      duration?: string;
      requirements?: string[];
      skills?: string[];
    };
  };

  @ApiProperty({
    description: 'Error message if verification failed',
    required: false,
    example: 'Certificate not found',
  })
  error?: string;
}
