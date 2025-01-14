import { Course } from 'src/modules/course/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notify')
export class Notify {
  @PrimaryGeneratedColumn({ name: 'notify_id' })
  notifyiId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['USER', 'COURSE', 'GLOBAL'],
    default: 'GLOBAL',
  })
  type: 'USER' | 'COURSE' | 'GLOBAL';

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @Column({ default: false })
  isGlobal: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
