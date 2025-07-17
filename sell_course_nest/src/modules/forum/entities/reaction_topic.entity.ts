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
import { Forum } from './forum.entity';

@Entity('reaction_topic')
@Unique(['user', 'forum'])
export class ReactionTopic {
  @PrimaryGeneratedColumn('uuid', { name: 'reaction_id' })
  reactionId: string;

  @ManyToOne(() => User, (user) => user.reactionTopics, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Forum, (forum) => forum.reactionTopics, { eager: true })
  @JoinColumn({ name: 'forum_id' })
  forum: Forum;

  @Column({
    type: 'enum',
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
    default: 'like',
  })
  reactionType: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
