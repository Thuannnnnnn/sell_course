import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateProfileDto {
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
  @IsDateString() // Validates an ISO 8601 date string
  birthDay?: string;

  @IsOptional()
  @IsPhoneNumber(null) // Validates a phone number
  phoneNumber?: string;
}
