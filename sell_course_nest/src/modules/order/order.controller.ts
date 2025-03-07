import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { FindOrderByEmailDto } from './dto/order.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('by_email/:email')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find orders by email' })
  @ApiResponse({ status: 200, description: 'Orders found', type: [Order] })
  async findOrderByEmail(
    @Param() param: FindOrderByEmailDto,
  ): Promise<Order[]> {
    return this.orderService.findOrderByEmail(param.email);
  }
}
