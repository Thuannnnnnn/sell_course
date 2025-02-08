import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  email: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
