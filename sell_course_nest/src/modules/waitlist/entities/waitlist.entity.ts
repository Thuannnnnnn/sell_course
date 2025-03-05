import {
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('waitlist')
export class Waitlist {
  @PrimaryGeneratedColumn('uuid', { name: 'waitlist_id' })
  waitlistId: string;

  @Column({ default: false })
  isChecked: boolean;

  @ManyToOne(() => User, (user) => user.waitlists)
  user: User;

  @ManyToOne(() => Course, (course) => course.waitlists)
  course: Course;
}
