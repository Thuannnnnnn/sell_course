import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('enrollment')
export class Enrollment {
  @PrimaryColumn({ type: 'int', name: 'enrollmentId' })
  enrollmentId: number;

  @ManyToOne(() => User, (user) => user.enrollments, { nullable: false })
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments, { nullable: false })
  course: Course;

  @CreateDateColumn()
  enroll_at: Date;

  @Column()
  status: string;
}
