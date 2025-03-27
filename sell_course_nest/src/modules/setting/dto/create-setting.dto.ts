import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSettingDto {
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsString()
  @IsOptional()
  logo?: Express.Multer.File;

  @ApiProperty({
    required: false,
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  carousel?: Express.Multer.File[];

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
