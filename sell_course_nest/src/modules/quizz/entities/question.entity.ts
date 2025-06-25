import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Quizz } from './quizz.entity';
import { AnswerEntity } from './answer.entity';

@Entity('questions')
export class Questionentity {
  @PrimaryColumn({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => Quizz, (quizz) => quizz.questions)
  @JoinColumn({ name: 'quizz_id' })
  quizz: Quizz;

  @Column({ type: 'text' })
  question: string;

  @Column({ 
    type: 'enum', 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @Column({ type: 'integer', default: 1 })
  weight: number;

  @OneToMany(() => AnswerEntity, (answer) => answer.question)
  answers: AnswerEntity[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
