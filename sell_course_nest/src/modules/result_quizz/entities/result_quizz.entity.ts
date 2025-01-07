import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Quizz } from '../../quizz/entities/quizz.entity';
import { User } from '../../user/entities/user.entity';

@Entity('resultQuizz')
export class ResultQuizz {
  @PrimaryGeneratedColumn({ name: 'resultQuizz_id' })
  resultQuizzId: number;

  @ManyToOne(() => Quizz)
  @JoinColumn({ name: 'quizz_id' })
  quizz: Quizz;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  score: number;

  @Column({ type: 'timestamp', name: 'submitted_at' })
  submittedAt: Date;
}
