import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Questionentity } from './question.entity';

@Entity('answersQuizz')
export class AnswerEntity {
  @PrimaryColumn({ name: 'answer_id', type: 'uuid' })
  anwserId: string;

  @ManyToOne(() => Questionentity, (question) => question.answers)
  question: Questionentity;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'boolean' })
  iscorrect: boolean;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
