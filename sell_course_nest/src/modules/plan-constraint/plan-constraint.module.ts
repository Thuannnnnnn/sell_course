import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanConstraint } from './plan-constraint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanConstraint])],
  providers: [],
  controllers: [],
  exports: [],
})
export class PlanConstraintModule {}
