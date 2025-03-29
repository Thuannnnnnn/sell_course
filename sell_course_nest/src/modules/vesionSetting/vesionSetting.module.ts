import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionSetting } from './entities/vesionSetting.entity';
import { VersionSettingService } from './vesionSetting.service';
import { VersionSettingController } from './vesionSetting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VersionSetting])],
  providers: [VersionSettingService],
  controllers: [VersionSettingController],
  exports: [VersionSettingService],
})
export class VersionSettingModule {}
