import {
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateExamFromQuizzesDto {
  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  questionsPerQuiz?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalQuestions?: number;

  @IsOptional()
  @IsBoolean()
  includeAllQuizzes?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  specificQuizIds?: string[];
}