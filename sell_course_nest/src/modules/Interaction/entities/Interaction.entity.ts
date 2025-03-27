import { Course } from 'src/modules/course/entities/course.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('interaction')
export class Interaction {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User, (user) => user.interactions)
  user: User;

  @ManyToOne(() => Course, (course) => course.interactions)
  course: Course;

  @Column({ default: 1 })
  interest_score: number;
}
