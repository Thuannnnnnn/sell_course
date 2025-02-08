import { IsUUID, IsString, IsOptional } from 'class-validator';

export class ResponseQaDto {
  @IsUUID()
  qaId: string;

  @IsString()
  userEmail: string;

  @IsString()
  username: string;

  @IsUUID()
  courseId: string;

  @IsString()
  text: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
  @IsString()
  createdAt: string;

  @IsString()
  @IsOptional()
  avatarImg?: string;
}
