import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Quizz } from '../../quizz/entities/quizz.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('quizz_store')
export class QuizzStore {
  @PrimaryColumn({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Quizz)
  @JoinColumn({ name: 'quizz_id' })
  quizz: Quizz;

  @Column({ type: 'float' })
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
