import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  purpose: string; // 'email_verification' hoặc 'password_reset'

  @IsString()
  @IsNotEmpty()
  lang: string;
}
