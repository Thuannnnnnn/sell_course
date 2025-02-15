import {
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ExamQuestion } from './examQuestion.entity';
import { Course } from 'src/modules/course/entities/course.entity';

@Entity('exam')
export class Exam {
  @PrimaryColumn({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @OneToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => ExamQuestion, (question) => question.exam)
  questions: ExamQuestion[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
