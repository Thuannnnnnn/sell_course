import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { FindOrderByEmailDto } from './dto/order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('by_email/:email')
  @ApiOperation({ summary: 'Find orders by email' })
  @ApiResponse({ status: 200, description: 'Orders found', type: [Order] })
  async findOrderByEmail(
    @Param() param: FindOrderByEmailDto,
  ): Promise<Order[]> {
    return this.orderService.findOrderByEmail(param.email);
  }
}
