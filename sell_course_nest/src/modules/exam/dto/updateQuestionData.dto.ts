import { 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  IsBoolean,
  IsUUID,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAnswerDto {
  @IsOptional()
  @IsUUID()
  answerId?: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class UpdateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers: UpdateAnswerDto[];
}