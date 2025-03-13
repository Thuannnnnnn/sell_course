import { Course } from 'src/modules/course/entities/course.entity';
import { UserNotify } from '../../User_Notify/entities/user_Notify.entity';

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

  @ManyToOne(() => Course, (course) => course.notifies, {
    nullable: true,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
