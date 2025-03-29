import { QuestionHabit } from 'src/modules/questionHabit/entities/questionHabit.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('userAnswer')
export class UserAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuestionHabit)
  question: QuestionHabit;

  @Column()
  answer: string;

  @ManyToOne(() => User, (user) => user.userAnswer)
  @JoinColumn({ name: 'userId' })
  user: User;
}
