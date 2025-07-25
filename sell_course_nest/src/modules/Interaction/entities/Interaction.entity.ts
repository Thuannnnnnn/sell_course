import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
export enum InteractionType {
  VIEW = 'VIEW',
  WISHLIST = 'WISHLIST',
  PURCHASE = 'PURCHASE',
}
@Entity('interaction')
export class Interaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.interactions)
  user: User;

  @ManyToOne(() => Course, (course) => course.interactions)
  course: Course;

  @Column({
    type: 'enum',
    enum: InteractionType,
    default: InteractionType.VIEW,
  })
  interaction_type: InteractionType;
}
