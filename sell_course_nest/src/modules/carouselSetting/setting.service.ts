import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VersionSetting } from '../../modules/vesionSetting/entities/vesionSetting.entity';
import { CarouselSetting } from './entities/setting.entity';
import { CreateCarouselSettingDto } from './dto/create-setting.dto';
import { UpdateCarouselSettingDto } from './dto/update-setting.dto';
import { azureUpload } from 'src/utilities/azure.service';

@Injectable()
export class CarouselSettingService {
  constructor(
    @InjectRepository(CarouselSetting)
    private readonly carouselSettingRepository: Repository<CarouselSetting>,
    @InjectRepository(VersionSetting)
    private readonly versionSettingRepository: Repository<VersionSetting>,
  ) {}

  /** Tạo mới một CarouselSetting */
  async create(
    createCarouselSettingDto: CreateCarouselSettingDto,
    file?: Express.Multer.File, // Thêm tham số file
  ): Promise<CarouselSetting> {
    const { carousel, versionSettingId } = createCarouselSettingDto;

    // Tìm VersionSetting theo ID
    const versionSetting = await this.versionSettingRepository.findOneBy({
      versionSettingId,
    });
    if (!versionSetting) {
      throw new NotFoundException(
        `VersionSetting với ID ${versionSettingId} không tồn tại`,
      );
    }

    // Tạo mới CarouselSetting
    const carouselSetting = this.carouselSettingRepository.create({
      carousel,
      versionSetting,
    });

    // Xử lý upload file nếu có
    if (file) {
      const imageUrl = await azureUpload(file);
      carouselSetting.carousel = imageUrl; // Gán URL của file vào carousel
    }

    return this.carouselSettingRepository.save(carouselSetting);
  }

  /** Lấy tất cả CarouselSetting */
  findAll(): Promise<CarouselSetting[]> {
    return this.carouselSettingRepository.find({
      relations: ['versionSetting'],
    });
  }

  async getByVersionId(versionId: string): Promise<CarouselSetting[]> {
    return this.carouselSettingRepository.find({
      where: { versionSetting: { versionSettingId: versionId } },
      relations: ['versionSetting'],
    });
  }

  /** Lấy một CarouselSetting theo ID */
  async findOne(id: string): Promise<CarouselSetting> {
    const carouselSetting = await this.carouselSettingRepository.findOne({
      where: { carouselSettingId: id },
      relations: ['versionSetting'],
    });
    if (!carouselSetting) {
      throw new NotFoundException(`CarouselSetting với ID ${id} không tồn tại`);
    }
    return carouselSetting;
  }

  async update(
    id: string,
    updateCarouselSettingDto: UpdateCarouselSettingDto,
    file?: Express.Multer.File,
  ): Promise<CarouselSetting> {
    const carouselSetting = await this.findOne(id);

    if (file) {
      const imageUrl = await azureUpload(file);
      carouselSetting.carousel = imageUrl;
    } else if (updateCarouselSettingDto.carousel) {
      carouselSetting.carousel = updateCarouselSettingDto.carousel;
    }

    if (updateCarouselSettingDto.versionSettingId) {
      const versionSetting = await this.versionSettingRepository.findOneBy({
        versionSettingId: updateCarouselSettingDto.versionSettingId,
      });
      if (!versionSetting) {
        throw new NotFoundException(
          `VersionSetting với ID ${updateCarouselSettingDto.versionSettingId} không tồn tại`,
        );
      }
      carouselSetting.versionSetting = versionSetting;
    }
    return this.carouselSettingRepository.save(carouselSetting);
  }
  /** Xóa một CarouselSetting */
  async remove(id: string): Promise<void> {
    const result = await this.carouselSettingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CarouselSetting với ID ${id} không tồn tại`);
    }
  }
}
