import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateVersionSettingDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
