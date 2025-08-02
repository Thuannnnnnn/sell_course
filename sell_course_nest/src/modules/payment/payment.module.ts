import { PaymentController } from './payment.controller';
import { Module } from '@nestjs/common';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { UserModule } from '../user/user.module';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [UserModule, EnrollmentModule, CourseModule, PromotionModule],
  controllers: [PaymentController],
  providers: [],
})
export class PaymentModule {}
