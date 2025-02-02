import { IsString, IsNumber } from 'class-validator';

export class LoginResponseDto {
  @IsString()
  token: string;

  // @IsString()
  // refreshToken: string;

  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  avartaImg: string;

  @IsString()
  gender: string;

  @IsString()
  birthDay: string;

  @IsNumber()
  phoneNumber: number;

  @IsString()
  role: string;
}
