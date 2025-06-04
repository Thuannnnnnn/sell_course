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
    const { email, course_id } = createCartDto;
    console.log(email, course_id);
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { courseId: course_id },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const cartId = uuidv4();
    const cartItem = this.cartRepository.create({ cartId, user, course });
    await this.cartRepository.save(cartItem);
    return true;
  }

  async getUserCart(email: string): Promise<CartResponseDto[]> {
    const cartItems = await this.cartRepository.find({
      where: { user: { email: email } },
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
      course_img: cart.course.thumbnail,
    }));
  }

  async removeFromCart(email: string, courseId: string): Promise<boolean> {
    console.log(email, courseId);
    const result = await this.cartRepository
      .createQueryBuilder()
      .delete()
      .from('cart')
      .where('email = :email', { email })
      .andWhere('course_id = :courseId', { courseId })
      .execute();

    console.log('Delete Result:', result);

    // Kiểm tra nếu affected không undefined và lớn hơn 0
    return result.affected ? result.affected > 0 : false;
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
