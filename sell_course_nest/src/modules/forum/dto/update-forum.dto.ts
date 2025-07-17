import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateForumDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({
    description: 'Upload a new image',
    type: 'string',
    format: 'binary', // Swagger sẽ hiển thị ô upload file
    required: false,
  })
  @IsOptional()
  image?: string; // Lưu URL ảnh dưới dạng string
}
