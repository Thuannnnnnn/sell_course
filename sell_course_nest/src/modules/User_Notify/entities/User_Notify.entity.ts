import { Notify } from '../../notify/entities/notify.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_notify')
export class UserNotify {
  @PrimaryGeneratedColumn('uuid', { name: 'userNotify_id' })
  id: string;

  @ManyToOne(() => User, (user) => user.userNotifies, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Notify, (notify) => notify.userNotifies, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'notify_id' })
  notify: Notify;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'boolean', default: false })
  is_sent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;
}
