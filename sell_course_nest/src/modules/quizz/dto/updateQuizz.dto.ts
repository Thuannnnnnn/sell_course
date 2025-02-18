import {
  IsArray,
  IsString,
  ValidateNested,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAnswerDto {
  @IsString()
  answer: string;

  @IsOptional()
  @IsUUID('4')
  answerId?: string;

  @IsBoolean()
  isCorrect: boolean;
}

class UpdateQuestionDto {
  @IsOptional()
  @IsUUID('4')
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
