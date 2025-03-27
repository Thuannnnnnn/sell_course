import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo chứng chỉ mới' })
  @ApiResponse({
    status: 201,
    description: 'Chứng chỉ đã được tạo thành công.',
  })
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificateService.create(createCertificateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Danh sách chứng chỉ.' })
  findAll() {
    return this.certificateService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách chứng chỉ theo ID người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách chứng chỉ của người dùng.',
  })
  findByUserId(@Param('userId') userId: string) {
    return this.certificateService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chứng chỉ theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin chứng chỉ.' })
  findOne(@Param('id') id: string) {
    return this.certificateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Chứng chỉ đã được cập nhật.' })
  update(
    @Param('id') id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    return this.certificateService.update(id, updateCertificateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Chứng chỉ đã được xóa.' })
  remove(@Param('id') id: string) {
    return this.certificateService.remove(id);
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Xác thực chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Kết quả xác thực chứng chỉ.' })
  verifyCertificate(@Param('id') id: string) {
    return this.certificateService.verifyCertificate(id);
  }
}
