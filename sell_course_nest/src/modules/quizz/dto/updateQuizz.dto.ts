import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAnswerDto {
  @IsString()
  answer: string;

  @IsString()
  anwserId?: string;

  isCorrect: boolean;
}

class UpdateQuestionDto {
  @IsString()
  questionId?: string;

  @IsString()
  question: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers: UpdateAnswerDto[];
}

export class UpdateQuizzDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions: UpdateQuestionDto[];
}
