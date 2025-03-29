import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateLogoSettingDto {
  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsUUID()
  versionSettingId?: string;
}
