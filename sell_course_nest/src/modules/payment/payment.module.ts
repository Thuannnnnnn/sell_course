import { PaymentController } from './payment.controller';
import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, EnrollmentModule, CartModule, CourseModule],
  controllers: [PaymentController],
  providers: [],
})
export class PaymentModule {}
