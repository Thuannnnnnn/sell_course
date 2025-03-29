import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogoSettingService } from './logoSetting.service';
import { CreateLogoSettingDto } from './dto/CreateLogoSettingDto.dto';
import { UpdateLogoSettingDto } from './dto/UpdateLogoSettingDto.dto';

@Controller('logo-settings')
export class LogoSettingController {
  constructor(private readonly logoSettingService: LogoSettingService) {}

  /** Tạo mới một LogoSetting với upload file */
  @Post()
  @UseInterceptors(FileInterceptor('imageInfo'))
  create(
    @Body() createLogoSettingDto: CreateLogoSettingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.logoSettingService.create(createLogoSettingDto, file);
  }

  @Get('by-version/:versionId')
  async getByVersionId(@Param('versionId') versionId: string) {
    return this.logoSettingService.getByVersionId(versionId);
  }

  /** Lấy tất cả LogoSetting */
  @Get()
  findAll() {
    return this.logoSettingService.findAll();
  }

  /** Lấy một LogoSetting theo ID */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logoSettingService.findOne(id);
  }

  /** Cập nhật một LogoSetting với upload file */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('imageInfo'))
  update(
    @Param('id') id: string,
    @Body() updateLogoSettingDto: UpdateLogoSettingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.logoSettingService.update(id, updateLogoSettingDto, file);
  }

  /** Xóa một LogoSetting */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logoSettingService.remove(id);
  }
}
