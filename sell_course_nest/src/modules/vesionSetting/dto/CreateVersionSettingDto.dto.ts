import { IsBoolean, IsOptional } from 'class-validator';

export class CreateVersionSettingDto {
  VersionSettingtitle?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
