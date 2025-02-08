import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { CoursePurchaseModule } from '../course_purchase/course_purchase.module';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Module({
  imports: [CoursePurchaseModule, Payment],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
