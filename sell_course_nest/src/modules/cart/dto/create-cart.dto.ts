import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCartDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
