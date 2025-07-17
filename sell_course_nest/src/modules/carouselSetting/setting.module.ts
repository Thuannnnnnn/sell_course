import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { VersionSetting } from '../vesionSetting/entities/vesionSetting.entity';
import { CarouselSetting } from './entities/setting.entity';
import { CarouselSettingController } from './setting.controller';
import { CarouselSettingService } from './setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarouselSetting, User, VersionSetting])],
  controllers: [CarouselSettingController],
  providers: [CarouselSettingService],
  exports: [CarouselSettingService],
})
export class CarouselSettingModule {}
