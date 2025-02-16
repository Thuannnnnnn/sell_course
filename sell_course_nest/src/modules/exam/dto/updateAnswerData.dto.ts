import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateAnswerDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Answer ID is required' })
  answerId: string;

  @IsString()
  @IsNotEmpty({ message: 'Answer text is required' })
  answer: string;

  @IsBoolean()
  isCorrect: boolean;
}
