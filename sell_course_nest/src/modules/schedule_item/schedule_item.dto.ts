import {
  IsUUID,
  IsInt,
  IsString,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateScheduleItemDto {
  @IsUUID()
  planId: string;

  @IsUUID()
  courseId: string;

  @IsInt()
  @IsIn([1, 2, 3, 4, 5, 6, 7])
  dayOfWeek: number;

  @IsString()
  startTime: string; // HH:mm

  @IsDateString()
  scheduledDate: string; // YYYY-MM-DD

  @IsInt()
  durationMin: number;

  @IsOptional()
  @IsInt()
  weekNumber?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  contentIds: string[];
}
