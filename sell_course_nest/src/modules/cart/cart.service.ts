import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async addToCart(createCartDto: CreateCartDto) {
    const { userId, courseId } = createCartDto;
    console.log(userId, courseId);
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const course = await this.courseRepository.findOne({ where: { courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const cartId = uuidv4(); // Generate unique cart ID
    const cartItem = this.cartRepository.create({ cartId, user, course });
    await this.cartRepository.save(cartItem);
    return true;
  }

  async getUserCart(userId: string): Promise<CartResponseDto[]> {
    const cartItems = await this.cartRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'course'],
    });

    if (!cartItems.length) {
      throw new NotFoundException('No cart items found for this user');
    }

    return cartItems.map((cart) => ({
      cart_id: cart.cartId,
      user_id: cart.user.user_id,
      user_name: cart.user.username,
      course_id: cart.course.courseId,
      course_title: cart.course.title,
      course_price: cart.course.price,
      course_img: cart.course.imageInfo,
    }));
  }

  async removeFromCart(cartId: string): Promise<void> {
    const result = await this.cartRepository.delete({ cartId });
    if (result.affected === 0) {
      throw new NotFoundException(`Cart item with ID ${cartId} not found`);
    }
  }

  async clearCart(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.cartRepository.delete({ user });
  }
}
