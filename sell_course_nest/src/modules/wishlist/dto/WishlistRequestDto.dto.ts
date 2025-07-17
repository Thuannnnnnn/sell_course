import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class WishlistRequestDto {

  @ApiProperty({ example: 'user123', description: 'ID của người dùng' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'course456', description: 'ID của khóa học' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: true, description: 'Trạng thái lưu vào wishlist' })
  @IsBoolean()
  save: boolean;
}
