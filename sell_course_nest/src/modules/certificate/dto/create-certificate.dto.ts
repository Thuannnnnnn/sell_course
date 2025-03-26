import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({ description: 'Tiêu đề chứng chỉ' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'ID của khóa học' })
  @IsUUID()
  courseId: string;

  @ApiProperty({ description: 'ID của người dùng' })
  @IsUUID()
  userId: string;
}
