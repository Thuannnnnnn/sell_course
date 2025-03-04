import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('forum')
export class Forum {
  @PrimaryGeneratedColumn('uuid', { name: 'forum_id' })
  forumId: string;

  @ManyToOne(() => User, (user) => user.forums, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column()
  text: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
