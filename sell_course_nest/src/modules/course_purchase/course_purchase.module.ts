import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePurchase } from './entities/course_purchase.entity';
import { Course_purchaseController } from './course_purchase.controller';
import { Course_purchaseService } from './course_purchase.service';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoursePurchase, User, Course])],

  providers: [Course_purchaseService],
  controllers: [Course_purchaseController],
  exports: [Course_purchaseService],
})
export class CoursePurchaseModule {}
