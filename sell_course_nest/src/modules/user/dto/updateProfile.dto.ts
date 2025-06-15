import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  avatarImg?: string;

  @IsOptional()
  @IsDateString() // Validates an ISO 8601 date string
  birthDay?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  @IsNumber({}, { message: 'Phone number must be a valid number' })
  @Min(900000000, {
    message: 'Phone number must start with 9 and have 9 digits',
  })
  @Max(999999999, {
    message: 'Phone number must start with 9 and have 9 digits',
  })
  phoneNumber?: number;
}

export class UserDto {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string | null;
  birthDay: string | null;
  phoneNumber: number | null;
  isOAuth: boolean;
  role: string;
  isBan: boolean;
  createdAt?: string;

  constructor(
    user_id: string,
    email: string,
    username: string,
    avatarImg: string | null,
    gender: string | null,
    birthDay: string | null,
    phoneNumber: number | null,
    isOAuth: boolean,
    role: string,
    isBan: boolean,
    createdAt?: Date,
  ) {
    this.user_id = user_id;
    this.email = email;
    this.username = username;
    this.avatarImg = avatarImg;
    this.gender = gender;
    this.birthDay = birthDay;
    this.phoneNumber = phoneNumber;
    this.isOAuth = isOAuth;
    this.role = role;
    this.isBan = isBan;
    this.createdAt = createdAt ? createdAt.toISOString() : undefined;
  }
}
