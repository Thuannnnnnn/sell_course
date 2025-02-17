import { IsOptional, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class UpdateLessonDTO {
  @IsOptional()
  @IsString()
  lessonName?: string;
}
class ContentDto {
  @Expose()
  contentId: string;

  @Expose()
  contentType: string;

  @Expose()
  order: number;
}

class LessonDto {
  @Expose()
  lessonId: string;

  @Expose()
  lessonName: string;

  @Expose()
  order: number;

  @Expose()
  @Type(() => ContentDto)
  contents: ContentDto[];
}

export class CourseWithLessonsDto {
  @Expose()
  courseId: string;

  @Expose()
  courseName: string;

  @Expose()
  @Type(() => LessonDto)
  lessons: LessonDto[];
}
