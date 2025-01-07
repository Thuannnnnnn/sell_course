import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('cart')
export class Cart {
  @PrimaryColumn({ name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;
}
