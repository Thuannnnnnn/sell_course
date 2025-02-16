import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateQuestionDto } from './updateQuestionData.dto';

export class UpdateExamDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Exam ID is required' })
  examId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions: UpdateQuestionDto[];
}
