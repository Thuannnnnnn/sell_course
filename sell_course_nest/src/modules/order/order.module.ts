import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
/*
 *https://docs.nestjs.com/modules
 */

import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
