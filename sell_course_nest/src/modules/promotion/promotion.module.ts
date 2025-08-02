import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PromotionSchedulerService } from './promotion-scheduler.service';
import { Promotion } from './entities/promotion.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, Course, User]),
    NotificationModule,
  ],
  controllers: [PromotionController],
  providers: [PromotionService, PromotionSchedulerService],
  exports: [PromotionService, PromotionSchedulerService],
})
export class PromotionModule {}
