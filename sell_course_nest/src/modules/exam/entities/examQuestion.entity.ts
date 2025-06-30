import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Answer } from './answerExam.entity';
import { Exam } from './exam.entity';

@Entity('examQuestions')
export class ExamQuestion {
  @PrimaryColumn({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => Exam, (exam) => exam.questions)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Column({ type: 'text', nullable: false })
  question: string;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
