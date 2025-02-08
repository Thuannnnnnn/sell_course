import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [Order],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
