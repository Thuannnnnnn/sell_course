import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VersionSetting } from '../../modules/vesionSetting/entities/vesionSetting.entity';
import { LogoSetting } from './entities/LogoSetting.entity';
import { LogoSettingService } from './logoSetting.service';
import { LogoSettingController } from './logoSetting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogoSetting, VersionSetting])],
  providers: [LogoSettingService],
  controllers: [LogoSettingController],
})
export class LogoSettingModule {}
