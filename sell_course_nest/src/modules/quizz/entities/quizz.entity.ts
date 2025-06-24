import {
  Entity,
  PrimaryColumn,
  OneToMany,
  Column,
  JoinColumn,
  OneToOne,
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

  @OneToOne(() => Contents)
  @JoinColumn({ name: 'content_id' })
  contents: Contents;

  @OneToMany(() => Questionentity, (question) => question.quizz)
  questions: Questionentity[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
