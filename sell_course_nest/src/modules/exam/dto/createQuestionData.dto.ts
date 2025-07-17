import { IsArray, IsNotEmpty, IsString, ValidateNested, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerDto } from './createAnswerData.dto';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsEnum(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsInt()
  @IsOptional()
  weight?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}