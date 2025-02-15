import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { ExamQuestion } from './examQuestion.entity';

@Entity('examAnswers')
export class Answer {
  @PrimaryColumn({ name: 'answer_id', type: 'uuid' })
  answerId: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'boolean' })
  isCorrect: boolean;

  @ManyToOne(() => ExamQuestion, (question) => question.answers)
  question: ExamQuestion;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
