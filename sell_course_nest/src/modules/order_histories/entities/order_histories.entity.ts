import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('order_histories')
export class OrderHistories {
  @PrimaryColumn({ name: 'orderHistories_id' })
  orderHistoriesId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'double precision' })
  totalPrice: number;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
