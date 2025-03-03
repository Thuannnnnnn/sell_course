import { Module } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Wishlist } from './entities/wishlist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistController } from './wishlistController.controller';
import { WishlistService } from './wishlistService.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Wishlist])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
