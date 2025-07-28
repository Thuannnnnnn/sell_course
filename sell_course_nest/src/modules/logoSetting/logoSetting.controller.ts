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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogoSettingService } from './logoSetting.service';
import { CreateLogoSettingDto } from './dto/CreateLogoSettingDto.dto';
import { UpdateLogoSettingDto } from './dto/UpdateLogoSettingDto.dto';
import { RolesGuard } from '../Auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../Auth/user.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../Auth/roles.decorator';

@Controller('logo-settings')
export class LogoSettingController {
  constructor(private readonly logoSettingService: LogoSettingService) {}

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('imageInfo'))
  create(
    @Body() createLogoSettingDto: CreateLogoSettingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.logoSettingService.create(createLogoSettingDto, file);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('by-version/:versionId')
  async getByVersionId(@Param('versionId') versionId: string) {
    return this.logoSettingService.getByVersionId(versionId);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  findAll() {
    return this.logoSettingService.findAll();
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logoSettingService.findOne(id);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('imageInfo'))
  update(
    @Param('id') id: string,
    @Body() updateLogoSettingDto: UpdateLogoSettingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.logoSettingService.update(id, updateLogoSettingDto, file);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logoSettingService.remove(id);
  }
}
