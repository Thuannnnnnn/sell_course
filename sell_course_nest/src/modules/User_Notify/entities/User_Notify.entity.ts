import { Notify } from 'src/modules/notify/entities/notify.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('User_Notify ')
export class UserNotify {
  @PrimaryGeneratedColumn({ name: 'userNotify_id' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Notify)
  @JoinColumn({ name: 'notify_id' })
  notify: Notify;

  @Column()
  is_read: string;

  @Column()
  is_sent: string;

  @Column()
  read_at: string;
}
