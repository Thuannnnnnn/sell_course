import { Course } from '../../course/entities/course.entity';
import { UserNotify } from '../../User_Notify/entities/User_Notify.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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
    enum: ['USER', 'COURSE', 'GLOBAL', 'ADMIN'],
    default: 'GLOBAL',
  })
  type: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';

  @Column({ default: false })
  isGlobal: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserNotify, (userNotify) => userNotify.notify)
  userNotifies: UserNotify[];

  @ManyToOne(() => Course, (course) => course.notifies, {
    nullable: true,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
