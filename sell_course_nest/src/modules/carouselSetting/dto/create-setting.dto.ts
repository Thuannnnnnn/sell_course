import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCarouselSettingDto {
  @IsNotEmpty()
  @IsString()
  carousel: string;

  @IsNotEmpty()
  @IsUUID()
  versionSettingId: string;
}
