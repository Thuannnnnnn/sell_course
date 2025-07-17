import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common';
import { VersionSettingService } from './vesionSetting.service';
import { CreateVersionSettingDto } from './dto/CreateVersionSettingDto.dto';
import { UpdateVersionSettingDto } from './dto/UpdateVersionSettingDto.dto';
import { VersionSetting } from './entities/vesionSetting.entity';

@Controller('version-settings')
export class VersionSettingController {
  constructor(private readonly versionSettingService: VersionSettingService) {}

  /** Lấy danh sách tất cả VersionSetting */
  @Get()
  findAll() {
    return this.versionSettingService.findAll();
  }

  @Get('active')
  getActiveVersion(): Promise<VersionSetting> {
    return this.versionSettingService.getActiveVersion();
  }
  /** Lấy thông tin một VersionSetting theo ID */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versionSettingService.findOne(id);
  }

  /** Tạo mới một VersionSetting */
  @Post()
  create(@Body() createVersionSettingDto: CreateVersionSettingDto) {
    return this.versionSettingService.create(createVersionSettingDto);
  }

  /** Cập nhật một VersionSetting */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVersionSettingDto: UpdateVersionSettingDto,
  ) {
    return this.versionSettingService.update(id, updateVersionSettingDto);
  }

  /** Xóa một VersionSetting */
  @Delete(':id')
  @HttpCode(204) // Trả về status code 204 No Content khi xóa thành công
  remove(@Param('id') id: string) {
    return this.versionSettingService.remove(id);
  }

  
}
