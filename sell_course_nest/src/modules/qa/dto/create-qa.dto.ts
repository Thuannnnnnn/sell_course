import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateQaDto {
  @IsString()
  userEmail: string;

  @IsUUID()
  courseId: string;

  @IsString()
  text: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
