import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsPhoneNumber, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  avatarImg?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  birthDay?: string;

  @IsOptional()
  phoneNumber?: number;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isOAuth?: boolean;

  @IsOptional()
  @IsBoolean()
  isBan?: boolean;
}