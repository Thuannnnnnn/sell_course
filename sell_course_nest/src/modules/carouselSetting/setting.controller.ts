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
} from '@nestjs/common';
import { CarouselSettingService } from './setting.service';
import { CreateCarouselSettingDto } from './dto/create-setting.dto';
import { UpdateCarouselSettingDto } from './dto/update-setting.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('carousel-settings')
export class CarouselSettingController {
  constructor(
    private readonly carouselSettingService: CarouselSettingService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createCarouselSettingDto: CreateCarouselSettingDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.carouselSettingService.create(createCarouselSettingDto, file);
  }
  /** Lấy tất cả CarouselSetting */
  @Get()
  findAll() {
    return this.carouselSettingService.findAll();
  }

  /** Lấy một CarouselSetting theo ID */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carouselSettingService.findOne(id);
  }

  /** Cập nhật một CarouselSetting */
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

  /** Xóa một CarouselSetting */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carouselSettingService.remove(id);
  }
}
