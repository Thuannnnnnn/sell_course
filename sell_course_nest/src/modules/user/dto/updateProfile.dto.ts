/*
 * import {
 *   IsDateString,
 *   IsEmail,
 *   IsOptional,
 *   IsPhoneNumber,
 *   IsString,
 * } from 'class-validator';
 */

/*
 * export class UserDto {
 *   @IsOptional()
 *   @IsEmail()
 *   email?: string;
 */

/*
 *   @IsOptional()
 *   @IsString()
 *   username?: string;
 */

/*
 *   @IsOptional()
 *   @IsString()
 *   gender?: string;
 */

/*
 *   @IsOptional()
 *   @IsString()
 *   avatarImg?: string;
 */

/*
 *   @IsOptional()
 *   @IsDateString() // Validates an ISO 8601 date string
 *   birthDay?: string;
 */

/*
 *   @IsOptional()
 *   @IsPhoneNumber(null) // Validates a phone number
 *   phoneNumber?: string;
 * }
 */

export class UserDto {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string | null;
  birthDay: string | null;
  phoneNumber: number;
  role: string;

  constructor(
    user_id: string,
    email: string,
    username: string,
    avatarImg: string | null,
    gender: string | null,
    birthDay: string | null,
    phoneNumber: number,
    role: string,
  ) {
    this.user_id = user_id;
    this.email = email;
    this.username = username;
    this.avatarImg = avatarImg;
    this.gender = gender;
    this.birthDay = birthDay;
    this.phoneNumber = phoneNumber;
    this.role = role;
  }
}
