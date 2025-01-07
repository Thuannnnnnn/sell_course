import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Course } from '../../course/entities/course.entity';

@Entity('lesson')
export class Lesson {
  @PrimaryColumn({ name: 'lesson_id' })
  lessonId: string;

  @Column({ name: 'courseId' })
  @ManyToOne(() => Course)
  courseId: string;

  @Column({ name: 'lesson_name' })
  lessonName: string;

  @Column({ name: 'create_at' })
  createAt: string;
}
