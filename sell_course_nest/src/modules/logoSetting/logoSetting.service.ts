import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionSetting } from '../../modules/vesionSetting/entities/vesionSetting.entity';
import { CreateLogoSettingDto } from './dto/CreateLogoSettingDto.dto';
import { LogoSetting } from './entities/LogoSetting.entity';
import { azureUpload } from 'src/utilities/azure.service';
import { UpdateLogoSettingDto } from './dto/UpdateLogoSettingDto.dto';

@Injectable()
export class LogoSettingService {
  constructor(
    @InjectRepository(LogoSetting)
    private readonly logoSettingRepository: Repository<LogoSetting>,
    @InjectRepository(VersionSetting)
    private readonly versionSettingRepository: Repository<VersionSetting>,
  ) {}

  async create(
    createLogoSettingDto: CreateLogoSettingDto,
    file?: Express.Multer.File,
  ): Promise<LogoSetting> {
    let imageUrl = createLogoSettingDto.logo;

    if (file) {
      imageUrl = await azureUpload(file);
    }

    const versionSetting = await this.versionSettingRepository.findOneBy({
      versionSettingId: createLogoSettingDto.versionSettingId,
    });
    if (!versionSetting) {
      throw new NotFoundException(
        `VersionSetting với ID ${createLogoSettingDto.versionSettingId} không tồn tại`,
      );
    }

    const logoSetting = this.logoSettingRepository.create({
      logo: imageUrl,
      versionSetting,
    });

    return this.logoSettingRepository.save(logoSetting);
  }

  findAll(): Promise<LogoSetting[]> {
    return this.logoSettingRepository.find({ relations: ['versionSetting'] });
  }

  async getByVersionId(versionId: string): Promise<LogoSetting[]> {
    return this.logoSettingRepository.find({
      where: { versionSetting: { versionSettingId: versionId } },
      relations: ['versionSetting'],
    });
  }

  async findOne(id: string): Promise<LogoSetting> {
    const logoSetting = await this.logoSettingRepository.findOne({
      where: { logoSettingId: id },
      relations: ['versionSetting'],
    });
    if (!logoSetting) {
      throw new NotFoundException(`LogoSetting với ID ${id} không tồn tại`);
    }
    return logoSetting;
  }

  async update(
    id: string,
    updateLogoSettingDto: UpdateLogoSettingDto,
    file?: Express.Multer.File,
  ): Promise<LogoSetting> {
    const logoSetting = await this.findOne(id);

    if (file) {
      const imageUrl = await azureUpload(file);
      logoSetting.logo = imageUrl;
    } else if (updateLogoSettingDto.logo) {
      logoSetting.logo = updateLogoSettingDto.logo;
    }

    if (updateLogoSettingDto.versionSettingId) {
      const versionSetting = await this.versionSettingRepository.findOneBy({
        versionSettingId: updateLogoSettingDto.versionSettingId,
      });
      if (!versionSetting) {
        throw new NotFoundException(
          `VersionSetting với ID ${updateLogoSettingDto.versionSettingId} không tồn tại`,
        );
      }
      logoSetting.versionSetting = versionSetting;
    }

    return this.logoSettingRepository.save(logoSetting);
  }

  async remove(id: string): Promise<void> {
    const result = await this.logoSettingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`LogoSetting với ID ${id} không tồn tại`);
    }
  }
}
