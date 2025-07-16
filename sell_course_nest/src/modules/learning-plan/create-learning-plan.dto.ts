import {
  IsString,
  IsInt,
  IsUUID,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class ConstraintDto {
  @IsString()
  type: string;

  @IsString()
  key: string;

  @IsString()
  value: string;
}

class PreferenceDto {
  @IsString()
  type: string;

  @IsString()
  value: string;

  @IsInt()
  weight: number;
}

export class CreateLearningPlanDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsString()
  studyGoal: string;

  @IsInt()
  totalWeeks: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConstraintDto)
  constraints: ConstraintDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceDto)
  preferences: PreferenceDto[];
}
