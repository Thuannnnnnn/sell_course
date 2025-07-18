import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanConstraintDto {
  @IsString()
  type: string;

  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class CreatePlanPreferenceDto {
  @IsString()
  type: string;

  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class CreateScheduleItemDto {
  @IsNumber()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsNumber()
  durationMin: number;

  @IsString()
  courseId: string;

  @IsArray()
  @IsString({ each: true })
  contentIds: string[];

  @IsNumber()
  weekNumber: number;

  @IsString()
  scheduledDate: string;
}

export class NarrativeBindingsDto {
  @IsOptional()
  @IsNumber()
  weekNumber?: number;

  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  contentId?: string;

  @IsOptional()
  @IsString()
  contentTitle?: string;

  @IsOptional()
  @IsString()
  contentTitles?: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  questions?: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

export class NarrativeItemDto {
  @IsString()
  template: string;

  @ValidateNested()
  @Type(() => NarrativeBindingsDto)
  bindings: NarrativeBindingsDto;
}

export class CreateLearningPlanDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsString()
  studyGoal: string;

  @IsNumber()
  totalWeeks: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanConstraintDto)
  constraints: CreatePlanConstraintDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanPreferenceDto)
  preferences: CreatePlanPreferenceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NarrativeItemDto)
  narrativeTemplates?: NarrativeItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleItemDto)
  scheduleItems?: CreateScheduleItemDto[];
}

export class UpdateLearningPlanDto {
  @IsOptional()
  @IsString()
  studyGoal?: string;

  @IsOptional()
  @IsNumber()
  totalWeeks?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanConstraintDto)
  constraints?: CreatePlanConstraintDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanPreferenceDto)
  preferences?: CreatePlanPreferenceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NarrativeItemDto)
  narrativeTemplates?: NarrativeItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleItemDto)
  scheduleItems?: CreateScheduleItemDto[];
}
