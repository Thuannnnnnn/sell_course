import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { Cart } from './entities/cart.entity';
@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(@Body() createCartDto: CreateCartDto) {
    if (!createCartDto) {
      throw new HttpException('Bad Request', 400);
    }
    if (!this.cartService.addToCart(createCartDto)) {
      throw new HttpException('server error', 500);
    }
    throw new HttpException('OK', 200);
  }

  @Get(':userId')
  async getUserCart(@Param('userId') userId: string): Promise<Cart[]> {
    return this.cartService.getUserCart(userId);
  }

  @Delete(':cartId')
  async removeFromCart(@Param('cartId') cartId: string): Promise<void> {
    await this.cartService.removeFromCart(cartId);
  }

  @Delete('clear/:userId')
  async clearCart(@Param('userId') userId: string): Promise<void> {
    await this.cartService.clearCart(userId);
  }
}
