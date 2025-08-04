import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CertificateService } from './certificate.service';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';
import { CertificateVerificationResponseDto } from './dto/certificate-verification-response.dto';

@ApiTags('public-certificates')
@Controller('api/public/certificate')
export class PublicCertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('verify')
  @ApiOperation({ 
    summary: 'Verify certificate authenticity',
    description: 'Public endpoint to verify certificate by ID - no authentication required'
  })
  @ApiResponse({
    status: 200,
    description: 'Certificate verification result',
    type: CertificateVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid certificate ID format',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async verifyCertificate(
    @Body() verifyCertificateDto: VerifyCertificateDto,
    @Res() res: Response,
  ) {
    try {
      console.log('🔍 Public certificate verification request:', verifyCertificateDto.certificateId);

      const result = await this.certificateService.verifyCertificate(
        verifyCertificateDto.certificateId,
      );

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('❌ Certificate verification error:', error);
      
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to verify certificate';
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
