import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  name: string;

  @Column()
  discount: number;

  @Column()
  code: string;

  @ManyToOne(() => Course, (course) => course.promotions)
  course: Course;
}
