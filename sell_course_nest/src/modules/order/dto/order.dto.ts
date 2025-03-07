import { ApiProperty } from '@nestjs/swagger';

export class FindOrderByEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email to find orders',
  })
  email: string;
}
