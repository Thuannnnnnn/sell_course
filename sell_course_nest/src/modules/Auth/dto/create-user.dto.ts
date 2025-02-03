import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  token: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  avartaImg?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthDay?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: number;

  @IsString()
  role: string;
}
