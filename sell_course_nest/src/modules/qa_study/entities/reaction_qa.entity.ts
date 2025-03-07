import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { QaStudy } from './qa.entity';

@Entity('reaction_Qa')
@Unique(['user', 'qa'])
export class ReactionQa {
  @PrimaryGeneratedColumn('uuid', { name: 'reaction_id' })
  reactionId: string;

  @ManyToOne(() => User, (user) => user.reactionQa, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => QaStudy, (QaStudy) => QaStudy.reactionQas, {
    eager: true,
  })
  @JoinColumn({ name: 'qa_study_id' })
  qa: QaStudy;

  @Column({
    type: 'enum',
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
    default: 'like',
  })
  reactionType: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
  QaStudy: any;
}
