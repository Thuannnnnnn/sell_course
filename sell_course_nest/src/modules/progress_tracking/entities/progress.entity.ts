import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Contents } from '../../contents/entities/contents.entity';

@Entity('progress_tracking')
export class ProgressTracking {
  @PrimaryGeneratedColumn('uuid')
  progress_id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Contents, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Contents;

  @ManyToOne(() => Lesson, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ default: false })
  is_completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
