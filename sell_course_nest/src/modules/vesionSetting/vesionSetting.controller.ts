import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { VersionSettingService } from './vesionSetting.service';
import { CreateVersionSettingDto } from './dto/CreateVersionSettingDto.dto';
import { UpdateVersionSettingDto } from './dto/UpdateVersionSettingDto.dto';
import { VersionSetting } from './entities/vesionSetting.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../Auth/user.enum';
import { Roles } from '../Auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';

@Controller('version-settings')
export class VersionSettingController {
  constructor(private readonly versionSettingService: VersionSettingService) {}

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  findAll() {
    return this.versionSettingService.findAll();
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('active')
  getActiveVersion(): Promise<VersionSetting> {
    return this.versionSettingService.getActiveVersion();
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versionSettingService.findOne(id);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  create(@Body() createVersionSettingDto: CreateVersionSettingDto) {
    return this.versionSettingService.create(createVersionSettingDto);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVersionSettingDto: UpdateVersionSettingDto,
  ) {
    return this.versionSettingService.update(id, updateVersionSettingDto);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @HttpCode(204) // Trả về status code 204 No Content khi xóa thành công
  remove(@Param('id') id: string) {
    return this.versionSettingService.remove(id);
  }
}
