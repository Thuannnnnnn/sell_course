import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@ApiTags('certificates')
@Controller('api/certificates') // Changed from 'certificates' to 'api/certificates'
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo chứng chỉ mới' })
  @ApiResponse({
    status: 201,
    description: 'Chứng chỉ đã được tạo thành công.',
  })
  async create(
    @Body() createCertificateDto: CreateCertificateDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.certificateService.create(createCertificateDto);
      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        message: 'Certificate created successfully',
        data: result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create certificate';
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: errorMessage,
        data: null,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Danh sách chứng chỉ.' })
  async findAll(@Res() res: Response) {
    try {
      const result = await this.certificateService.findAll();
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Certificates fetched successfully',
        data: result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch certificates';
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessage,
        data: null,
      });
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách chứng chỉ theo ID người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách chứng chỉ của người dùng.',
  })
  async findByUserId(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const result = await this.certificateService.findByUserId(userId);
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'User certificates fetched successfully',
        data: result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch user certificates';
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessage,
        data: null,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chứng chỉ theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin chứng chỉ.' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.certificateService.findOne(id);
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Certificate fetched successfully',
        data: result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch certificate';
      const status = errorMessage.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: status,
        message: errorMessage,
        data: null,
      });
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Chứng chỉ đã được cập nhật.' })
  async update(
    @Param('id') id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.certificateService.update(
        id,
        updateCertificateDto,
      );
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Certificate updated successfully',
        data: result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update certificate';
      const status = errorMessage.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;
      return res.status(status).json({
        status: status,
        message: errorMessage,
        data: null,
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Chứng chỉ đã được xóa.' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.certificateService.remove(id);
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Certificate deleted successfully',
        data: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete certificate';
      const status = errorMessage.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        status: status,
        message: errorMessage,
        data: null,
      });
    }
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Xác thực chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Kết quả xác thực chứng chỉ.' })
  async verifyCertificate(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.certificateService.verifyCertificate(id);
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Certificate verification completed',
        data: result,
      });
    } catch {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Certificate not found or invalid',
        data: false,
      });
    }
  }

  @Get(':id/xml')
  @ApiOperation({ summary: 'Tạo và trả về XML của chứng chỉ' })
  @ApiResponse({ status: 200, description: 'XML chứng chỉ.' })
  async getCertificateXML(@Param('id') id: string, @Res() res: Response) {
    try {
      const xml = await this.certificateService.generateCertificateXML(id);
      res.set({
        'Content-Type': 'application/xml',
        'Content-Disposition': `inline; filename="certificate-${id}.xml"`,
      });
      return res.send(xml);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate certificate XML';
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: errorMessage,
        data: null,
      });
    }
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Tạo và tải xuống PDF của chứng chỉ' })
  @ApiResponse({ status: 200, description: 'PDF chứng chỉ.' })
  async getCertificatePDF(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer =
        await this.certificateService.generateCertificatePDF(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      return res.send(pdfBuffer);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate certificate PDF';
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: errorMessage,
        data: null,
      });
    }
  }
}
