import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

@Entity('contents')
export class Contents {
  @PrimaryGeneratedColumn('uuid', { name: 'content_id' })
  contentId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.contents, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @Column({ name: 'content_name', type: 'varchar', length: 255 })
  contentName: string;

  @Column({ name: 'content_type', type: 'varchar' })
  contentType: string;

  @Column({ name: 'order', type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
