import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { User } from '../user/entities/user.entity';
import { azureUpload } from 'src/utilities/azure.service';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async create(
    createSettingDto: CreateSettingDto,
    user: User,
    logo?: Express.Multer.File,
    carousel?: Express.Multer.File[],
  ) {
    let logoUrl = null;
    let carouselUrls = [];

    // Logo already has the correct format from Multer
    if (logo) {
      logoUrl = await azureUpload(logo);
    }

    // Carousel files already have the correct format from Multer
    if (carousel && carousel.length > 0) {
      carouselUrls = await Promise.all(
        carousel.map(async (file) => {
          return await azureUpload(file);
        }),
      );
      carouselUrls = carouselUrls.filter((url) => url !== null);
    }

    const setting = this.settingRepository.create({
      ...createSettingDto,
      logo: logoUrl,
      carousel: carouselUrls,
      user,
    });

    return await this.settingRepository.save(setting);
  }

  async findAll() {
    return await this.settingRepository.find({
      relations: ['user'],
    });
  }

  async findActive() {
    return await this.settingRepository.findOne({
      where: { isActive: true },
      relations: ['user'],
    });
  }

  async findOne(id: string) {
    return await this.settingRepository.findOne({
      where: { settingId: id },
      relations: ['user'],
    });
  }

  async update(
    id: string,
    updateSettingDto: UpdateSettingDto,
    logo?: Express.Multer.File,
    carousel?: Express.Multer.File[],
  ) {
    const setting = await this.findOne(id);
    if (!setting) {
      throw new Error('Setting not found');
    }

    let logoUrl = setting.logo;
    let carouselUrls = setting.carousel || [];

    // Logo already has the correct format from Multer
    if (logo) {
      logoUrl = await azureUpload(logo);
    }

    // Carousel files already have the correct format from Multer
    if (carousel && carousel.length > 0) {
      const newCarouselUrls = await Promise.all(
        carousel.map(async (file) => {
          return await azureUpload(file);
        }),
      );
      carouselUrls = [
        ...carouselUrls,
        ...newCarouselUrls.filter((url) => url !== null),
      ];
    }

    Object.assign(setting, {
      ...updateSettingDto,
      logo: logoUrl,
      carousel: carouselUrls,
    });

    return await this.settingRepository.save(setting);
  }

  async remove(id: string) {
    const setting = await this.findOne(id);
    if (!setting) {
      throw new Error('Setting not found');
    }
    return await this.settingRepository.remove(setting);
  }
}
