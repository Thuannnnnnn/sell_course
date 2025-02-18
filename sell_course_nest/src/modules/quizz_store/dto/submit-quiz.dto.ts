import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

class AnsweSubmitDto {
  @IsString()
  questionId: string;

  @IsString()
  anwserId: string;
}

export class SubmitQuizDto {
  @IsUUID()
  quizzId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnsweSubmitDto)
  answers: AnsweSubmitDto[];
}
