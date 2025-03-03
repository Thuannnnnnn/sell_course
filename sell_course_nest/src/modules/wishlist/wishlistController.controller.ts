import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WishlistService } from './wishlistService.service';
import { WishlistRequestDto } from './dto/WishlistRequestDto.dto';
import { WishlistResponseDto } from './dto/WishlistResponseDto.dto';

@ApiTags('Wishlist')
@Controller('api/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiBearerAuth('Authorization')
  @Post('add')
  @ApiOperation({ summary: 'Thêm khóa học vào wishlist' })
  @ApiResponse({
    status: 201,
    description: 'Wishlist item created successfully',
    type: WishlistResponseDto,
  })
  async addToWishlist(
    @Body() dto: WishlistRequestDto,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.addToWishlist(dto);
  }

  @ApiBearerAuth('Authorization')
  @Get(':userId')
  @ApiOperation({ summary: 'Lấy danh sách wishlist của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách wishlist của người dùng',
    type: [WishlistResponseDto],
  })
  async getWishlist(
    @Param('userId') userId: string,
  ): Promise<WishlistResponseDto[]> {
    return this.wishlistService.getWishlistByUser(userId);
  }

  @ApiBearerAuth('Authorization')
  @Delete(':wishlistId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa khóa học khỏi wishlist' })
  @ApiResponse({
    status: 204,
    description: 'Wishlist item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  async removeFromWishlist(
    @Param('wishlistId') wishlistId: string,
  ): Promise<string> {
    return this.wishlistService.removeFromWishlist(wishlistId);
  }
}
