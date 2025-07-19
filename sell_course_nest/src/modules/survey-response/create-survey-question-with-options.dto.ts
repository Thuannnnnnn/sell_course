import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSurveyQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsNotEmpty()
  type: 'single' | 'multiple' | 'text';

  @IsBoolean()
  required: boolean;

  @IsArray()
  @IsString({ each: true })
  options: string[];
}

export class UpdateSurveyQuestionWithOptionsDto {
  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsOptional()
  type?: 'single' | 'multiple' | 'text';

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsArray()
  @IsOptional()
  options?: string[];
}
