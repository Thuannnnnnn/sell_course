import { ApiProperty } from '@nestjs/swagger';

export class WishlistResponseDto {
  @ApiProperty({ example: 'wishlist789', description: 'ID của wishlist' })
  wishlistId: string;

  @ApiProperty({ example: 'user123', description: 'ID của người dùng' })
  userId: string;

  @ApiProperty({ example: 'course456', description: 'ID của khóa học' })
  courseId: string;

  @ApiProperty({ example: true, description: 'Trạng thái lưu vào wishlist' })
  save: boolean;
}
