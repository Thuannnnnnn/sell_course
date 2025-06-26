import {
  IsArray,
  IsString,
  ValidateNested,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
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

  @IsEnum(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  weight?: number;

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
