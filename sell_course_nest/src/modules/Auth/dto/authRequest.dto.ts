import { IsString, IsEmail, IsOptional } from 'class-validator';

export class OAuthRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  picture?: string;
}
