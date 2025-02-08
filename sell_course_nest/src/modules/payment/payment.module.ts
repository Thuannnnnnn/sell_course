import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Module } from '@nestjs/common';
import { CoursePurchaseModule } from '../course_purchase/course_purchase.module';
import { OrderModule } from '../order/order.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [CoursePurchaseModule, OrderModule, CartModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
