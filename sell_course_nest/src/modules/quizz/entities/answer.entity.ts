import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Questionentity } from './question.entity';

@Entity('answersQuizz')
export class AnswerEntity {
  @PrimaryColumn({ name: 'answer_id', type: 'uuid' })
  answerId: string;

  @ManyToOne(() => Questionentity, (question) => question.answers)
  question: Questionentity;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'boolean' })
  isCorrect: boolean;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
