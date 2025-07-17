import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanPreference } from './plan-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanPreference])],
  providers: [],
  controllers: [],
  exports: [],
})
export class PlanPreferenceModule {}
