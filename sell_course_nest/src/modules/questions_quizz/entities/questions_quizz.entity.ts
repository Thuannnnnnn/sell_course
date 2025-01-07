import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Quizz } from '../../quizz/entities/quizz.entity';

@Entity('questions_quizz')
export class QuestionsQuizz {
  @PrimaryColumn({ name: 'questionsQuizz_id' })
  questionsQuizzId: string;

  @Column()
  text: string;

  @ManyToOne(() => Quizz)
  @JoinColumn({ name: 'questionQuizz_id' })
  quizz: Quizz;
}
