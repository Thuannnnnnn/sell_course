import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('forum')
export class Forum {
  @PrimaryColumn({ name: 'forum_id' })
  forumId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column()
  text: string;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
