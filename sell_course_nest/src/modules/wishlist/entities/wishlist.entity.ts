import {
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('wishlist')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid', { name: 'wishlist_id' })
  wishlistId: string;

  @Column()
  courseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'boolean', default: false })
  save: boolean;
}
