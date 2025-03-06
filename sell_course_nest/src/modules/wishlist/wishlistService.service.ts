import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { plainToClass } from 'class-transformer';
import { User } from '../user/entities/user.entity';
import { Wishlist } from './entities/wishlist.entity';
import { Course } from '../course/entities/course.entity';
import { WishlistRequestDto } from './dto/WishlistRequestDto.dto';
import { WishlistResponseDto } from './dto/WishlistResponseDto.dto';
@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async addToWishlist(dto: WishlistRequestDto): Promise<WishlistResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const course = await this.courseRepository.findOne({
      where: { courseId: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    let wishlist = await this.wishlistRepository.findOne({
      where: {
        user: { user_id: dto.userId },
        course: { courseId: dto.courseId },
      },
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: { user_id: dto.userId },
        course: { courseId: dto.courseId },
        save: dto.save,
      });
    } else {
      wishlist.save = dto.save;
    }

    await this.wishlistRepository.save(wishlist);
    return plainToClass(WishlistResponseDto, wishlist, {
      excludeExtraneousValues: true,
    });
  }

  async getWishlistByUser(userId: string): Promise<any> {
    const wishlist = await this.wishlistRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'course'],
    });

    return wishlist;
  }

  async removeFromWishlist(courseId: string): Promise<string> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { courseId },
    });
    if (!wishlist) throw new NotFoundException('Wishlist item not found');
    await this.wishlistRepository.remove(wishlist);
    return 'Wishlist item removed successfully';
  }
}
