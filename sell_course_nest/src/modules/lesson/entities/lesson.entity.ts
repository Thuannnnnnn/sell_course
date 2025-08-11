import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Contents } from '../../contents/entities/contents.entity';

@Entity('lesson')
export class Lesson {
  @PrimaryGeneratedColumn('uuid', { name: 'lesson_id' })
  lessonId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @Column({ name: 'lesson_name' })
  lessonName: string;

  @Column({ name: 'order', type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Contents, (content) => content.lesson, { cascade: true, onDelete: 'CASCADE' })
  contents: Contents[];
}
