import {
  Entity,
  PrimaryColumn,
  OneToMany,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Contents } from '../../contents/entities/contents.entity';
import { Questionentity } from './question.entity';

@Entity('quizz')
export class Quizz {
  @PrimaryColumn({ name: 'quizz_id', type: 'uuid' })
  quizzId: string;

  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Contents, (contents) => contents.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  contents: Contents;

  @OneToMany(() => Questionentity, (question) => question.quizz, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  questions: Questionentity[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
