import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Contents } from '../../contents/entities/contents.entity';
import { Questionentity } from './question.entity';

@Entity('quizz')
export class Quizz {
  @PrimaryColumn({ name: 'quizz_id', type: 'uuid' })
  quizzId: string;

  @ManyToOne(() => Contents)
  @JoinColumn({ name: 'content_id' })
  contents: Contents;

  @OneToMany(() => Questionentity, (question) => question.quizz)
  questions: Questionentity[];

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
