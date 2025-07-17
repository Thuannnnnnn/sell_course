import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('feedback_ratting')
export class FeedbackRatting {
  @PrimaryGeneratedColumn('uuid', { name: 'feedback_ratting_id' })
  feedbackRattingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;

  @Column('int')
  star: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column('real', { array: true })
  embedding: number[];
}
