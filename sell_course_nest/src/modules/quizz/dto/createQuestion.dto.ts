import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateAnswerDto } from './createAnswer.dto';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}
