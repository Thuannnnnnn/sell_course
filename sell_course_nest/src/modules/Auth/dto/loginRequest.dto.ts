import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  @ApiProperty({
    description: 'email',
    example: 'tranquocthuan2003@gmail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'password',
    example: '12345678',
  })
  password: string;
}
