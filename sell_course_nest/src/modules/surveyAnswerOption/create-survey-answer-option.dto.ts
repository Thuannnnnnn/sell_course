import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSurveyAnswerOptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsUUID()
  questionId: string;
}
