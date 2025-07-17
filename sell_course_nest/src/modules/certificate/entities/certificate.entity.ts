import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('certificate')
export class Certificate {
  @PrimaryGeneratedColumn('uuid', { name: 'certificate_id' })
  certificateId: string;

  @Column()
  title: string;

  @ManyToOne(() => Course, (course) => course.certificates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User, (user) => user.certificates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
