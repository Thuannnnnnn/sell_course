import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('course_purchase')
export class CoursePurchase {
  @PrimaryGeneratedColumn('uuid', { name: 'coursePurchase_id' })
  coursePurchaseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;
}
