import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLogoSettingDto {
  @IsNotEmpty()
  @IsString()
  logo: string;

  @IsNotEmpty()
  @IsUUID()
  versionSettingId: string;
}
