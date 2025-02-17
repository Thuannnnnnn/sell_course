import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Exam } from '../../exam/entities/exam.entity';
import { User } from '../../user/entities/user.entity';

@Entity('result_exam')
export class ResultExam {
  @PrimaryColumn({ name: 'resultExam_id', type: 'uuid' })
  resultExamId: string;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  email: string;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'jsonb' })
  answers: {
    questionId: string;
    selectedAnswerId: string;
    isCorrect: boolean;
  }[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
