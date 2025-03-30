import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCarouselSettingDto {
  @IsOptional()
  @IsString()
  carousel?: string;

  @IsOptional()
  @IsUUID()
  versionSettingId?: string;
}
