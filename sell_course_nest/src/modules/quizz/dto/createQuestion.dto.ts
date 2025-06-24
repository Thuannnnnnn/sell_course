import { IsArray, IsNotEmpty, IsString, ValidateNested, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { CreateAnswerDto } from './createAnswer.dto';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsEnum(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}
