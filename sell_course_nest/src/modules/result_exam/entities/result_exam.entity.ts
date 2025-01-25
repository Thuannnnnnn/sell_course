import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Exam } from '../../exam/entities/exam.entity';
import { User } from '../../user/entities/user.entity';

@Entity('result_exam')
export class ResultExam {
  @PrimaryColumn({ name: 'resultExam_id' })
  resultExamId: string;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  score: number;

  @Column({ type: 'timestamp', name: 'submitted_at' })
  submittedAt: Date;
}
