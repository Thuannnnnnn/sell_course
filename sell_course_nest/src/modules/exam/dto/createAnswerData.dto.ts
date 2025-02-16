import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;
}
