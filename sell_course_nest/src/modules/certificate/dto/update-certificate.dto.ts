import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateCertificateDto {
  @ApiProperty({ description: 'Tiêu đề chứng chỉ', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'ID của khóa học', required: false })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ description: 'ID của người dùng', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
