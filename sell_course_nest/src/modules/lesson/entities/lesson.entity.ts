import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('lesson')
export class Lesson {
  @PrimaryColumn({ name: 'lesson_id' })
  lessonId: string;

  @Column({ name: 'courseId' })
  courseId: string;

  @Column({ name: 'lesson_name' })
  lessonName: string;

  @Column({ name: 'create_at' })
  createAt: string;
}
