import { UserNotify } from '../../User_Notify/entities/user_Notify.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notify')
export class Notify {
  @PrimaryGeneratedColumn('uuid', { name: 'notify_id' })
  notifyId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['USER', 'COURSE', 'GLOBAL'],
    default: 'GLOBAL',
  })
  type: 'USER' | 'COURSE' | 'GLOBAL';

  @Column({ default: false })
  isGlobal: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserNotify, (userNotify) => userNotify.notify)
  userNotifies: UserNotify[];
}
