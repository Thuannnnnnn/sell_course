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
import { CartResponseDto } from './dto/cart-response.dto';
@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(@Body() createCartDto: CreateCartDto) {
    if (!createCartDto) {
      throw new HttpException('Bad Request', 400);
    }
    const response = this.cartService.addToCart(createCartDto);
    if (!response) {
      throw new HttpException('server error', 500);
    }
    throw new HttpException('OK', 200);
  }

  @Get(':email')
  async getUserCart(@Param('email') email: string): Promise<CartResponseDto[]> {
    const response = this.cartService.getUserCart(email);
    if (!response) {
      throw new HttpException('server error', 500);
    }
    return response;
  }
  @Delete()
  async removeFromCart(
    @Body() body: { email: string; courseId: string },
  ): Promise<void> {
    if (!body.email || !body.courseId) {
      throw new HttpException('Bad request', 400);
    }
    const response = await this.cartService.removeFromCart(
      body.email,
      body.courseId,
    );
    if (!response) {
      throw new HttpException('server error', 500);
    }
    throw new HttpException('OK', 200);
  }
  @Delete('clear/:userId')
  async clearCart(@Param('userId') userId: string): Promise<void> {
    await this.cartService.clearCart(userId);
  }
}
