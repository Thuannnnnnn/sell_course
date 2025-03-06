import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Forum } from '../../forum/entities/forum.entity';

@Entity('discussion')
export class Discussion {
  @PrimaryGeneratedColumn('uuid', { name: 'discussion_id' })
  discussionId: string;

  @ManyToOne(() => User, (user) => user.discussions, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Forum, (forum) => forum.discussions, { eager: true })
  @JoinColumn({ name: 'forum_id' })
  forum: Forum;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
