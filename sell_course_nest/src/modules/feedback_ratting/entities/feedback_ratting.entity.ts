import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('feedback_ratting')
export class FeedbackRatting {
  @PrimaryColumn({ name: 'feedback_ratting_id' })
  feedbackRattingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;

  @Column('int')
  star: number;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
