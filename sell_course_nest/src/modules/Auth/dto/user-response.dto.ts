import { IsString } from 'class-validator';

export class UserResponseDto {
  @IsString()
  user_id: string;

  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  phoneNumber: number;

  @IsString()
  avartaImg: string;

  @IsString()
  gender: string;

  @IsString()
  birthDay: string;

  @IsString()
  role: string;

  @IsString()
  createdAt: string;
}
