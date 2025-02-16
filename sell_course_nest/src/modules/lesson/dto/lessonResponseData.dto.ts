import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDTO {
    @ApiProperty({ example: 'lesson-001', description: 'Lesson ID' })
    lessonId: string;

    @ApiProperty({ example: 'course-123', description: 'Associated Course ID' })
    courseId: string;

    @ApiProperty({ example: 'Introduction to TypeScript', description: 'Lesson Name' })
    lessonName: string;
  }

  export class UpdateLessonDTO {
    @ApiProperty({ example: 'Advanced TypeScript', description: 'Updated Lesson Name', required: false })
    lessonName?: string;
  }
