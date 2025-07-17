import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { VersionSetting } from './entities/vesionSetting.entity';
import { CreateVersionSettingDto } from './dto/CreateVersionSettingDto.dto';
import { UpdateVersionSettingDto } from './dto/UpdateVersionSettingDto.dto';

@Injectable()
export class VersionSettingService {
  constructor(
    @InjectRepository(VersionSetting)
    private readonly versionSettingRepository: Repository<VersionSetting>,
  ) {}

  /** Lấy tất cả VersionSetting */
  findAll(): Promise<VersionSetting[]> {
    return this.versionSettingRepository.find();
  }

  /** Lấy một VersionSetting theo ID */
  async findOne(id: string): Promise<VersionSetting> {
    const versionSetting = await this.versionSettingRepository.findOneBy({
      versionSettingId: id,
    });
    if (!versionSetting) {
      throw new NotFoundException(`VersionSetting với ID ${id} không tìm thấy`);
    }
    return versionSetting;
  }

  /** Tạo mới một VersionSetting */
  async create(
    createVersionSettingDto: CreateVersionSettingDto,
  ): Promise<VersionSetting> {
    const versionSetting = this.versionSettingRepository.create({
      ...createVersionSettingDto,
      VersionSettingtitle: createVersionSettingDto.VersionSettingtitle,
      isActive: createVersionSettingDto.isActive ?? false, // Giá trị mặc định nếu không cung cấp
    });
    return this.versionSettingRepository.save(versionSetting);
  }

  /** Cập nhật một VersionSetting */
  async update(
    id: string,
    updateVersionSettingDto: UpdateVersionSettingDto,
  ): Promise<VersionSetting> {
    // Nếu đang set active = true
    if (updateVersionSettingDto.isActive) {
      // Tắt active của tất cả các version khác
      await this.versionSettingRepository.update(
        { versionSettingId: Not(id) },
        { isActive: false },
      );
    }

    const versionSetting = await this.findOne(id);
    Object.assign(versionSetting, updateVersionSettingDto);
    return this.versionSettingRepository.save(versionSetting);
  }
  /** Xóa một VersionSetting */
  async remove(id: string): Promise<void> {
    const result = await this.versionSettingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`VersionSetting với ID ${id} không tìm thấy`);
    }
  }

  async getActiveVersion(): Promise<VersionSetting> {
    const activeVersion = await this.versionSettingRepository.findOne({
      where: { isActive: true },
    });

    if (!activeVersion) {
      throw new NotFoundException('Không tìm thấy version active');
    }

    return activeVersion;
  }
}
