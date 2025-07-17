import { ApiProperty } from '@nestjs/swagger';

export class RoleOption {
  @ApiProperty({ example: 'ADMIN' })
  value: string;

  @ApiProperty({ example: 'Quản trị viên' })
  label: string;

  @ApiProperty({ example: 'Gửi thông báo cho tất cả quản trị viên hệ thống' })
  description: string;

  @ApiProperty({ example: 'admin' })
  icon: string;

  @ApiProperty({ example: '#ff4d4f' })
  color: string;
}

export class RoleListDto {
  @ApiProperty({ type: [RoleOption] })
  roles: RoleOption[];

  @ApiProperty({ example: 'Danh sách các role có thể gửi thông báo' })
  message: string;
}