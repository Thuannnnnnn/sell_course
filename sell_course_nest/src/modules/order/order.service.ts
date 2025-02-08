import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  // 🔹 Tạo đơn hàng mới
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder = this.orderRepository.create(orderData);
    return this.orderRepository.save(newOrder);
  }

  // 🔹 Tìm đơn hàng theo orderCode
  async findByOrderCode(orderCode: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { orderCode } });
  }

  // 🔹 Cập nhật trạng thái thanh toán
  async updateOrderStatus(
    orderCode: number,
    updateData: Partial<Order>,
  ): Promise<Order> {
    await this.orderRepository.update({ orderCode }, updateData);
    return this.findByOrderCode(orderCode);
  }
}
