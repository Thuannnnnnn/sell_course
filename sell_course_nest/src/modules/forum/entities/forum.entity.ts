import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ReactionTopic } from './reaction_topic.entity';
import { Discussion } from './discussion.entity';

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
  @OneToMany(() => ReactionTopic, (reactionTopic) => reactionTopic.forum)
  reactionTopics: ReactionTopic[];
  @OneToMany(() => Discussion, (discussion) => discussion.forum)
  discussions: Discussion[];
}
