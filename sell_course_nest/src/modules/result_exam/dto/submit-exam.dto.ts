import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

class AnswerSubmitDto {
  @IsString()
  questionId: string;

  @IsString()
  answerId: string;
}

export class SubmitExamDto {
  @IsUUID()
  examId: string;
  @IsString()
  courseId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerSubmitDto)
  answers: AnswerSubmitDto[];
}
