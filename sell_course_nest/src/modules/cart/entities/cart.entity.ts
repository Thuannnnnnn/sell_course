import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('cart')
export class Cart {
  @PrimaryColumn({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'courseId' })
  course: Course;
}
