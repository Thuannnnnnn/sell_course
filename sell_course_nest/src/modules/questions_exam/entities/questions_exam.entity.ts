import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Exam } from '../../exam/entities/exam.entity';

@Entity('questions_exam')
export class QuestionsExam {
  @PrimaryColumn({ name: 'questionsExam_id' })
  questionsExamId: string;

  @Column()
  text: string;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'questionExam_id' })
  exam: Exam;
}
