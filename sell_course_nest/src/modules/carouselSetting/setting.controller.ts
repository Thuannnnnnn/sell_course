import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CarouselSettingService } from './setting.service';
import { CreateCarouselSettingDto } from './dto/create-setting.dto';
import { UpdateCarouselSettingDto } from './dto/update-setting.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../Auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../Auth/user.enum';
import { Roles } from '../Auth/roles.decorator';
@Controller('carousel-settings')
export class CarouselSettingController {
  constructor(
    private readonly carouselSettingService: CarouselSettingService,
  ) {}

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createCarouselSettingDto: CreateCarouselSettingDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.carouselSettingService.create(createCarouselSettingDto, file);
  }

  @Get()
  findAll() {
    return this.carouselSettingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carouselSettingService.findOne(id);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateCarouselSettingDto: UpdateCarouselSettingDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.carouselSettingService.update(
      id,
      updateCarouselSettingDto,
      file,
    );
  }

  @Get('by-version/:versionId')
  async getByVersionId(@Param('versionId') versionId: string) {
    return this.carouselSettingService.getByVersionId(versionId);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.MARKETINGMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carouselSettingService.remove(id);
  }
}
