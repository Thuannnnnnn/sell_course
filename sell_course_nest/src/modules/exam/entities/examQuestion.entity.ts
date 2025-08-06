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

  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @ManyToOne(() => Exam, (exam) => exam.questions, {
    onDelete: 'CASCADE', // Delete questions when exam is deleted
  })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({
    type: 'enum',
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @Column({ type: 'integer', default: 1 })
  weight: number;

  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true, // Save/update answers when question is saved
    eager: true, // Always load answers with questions
  })
  answers: Answer[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
