import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from 'src/modules/course/entities/course.entity';

@Entity('qa')
export class Qa {
  @PrimaryGeneratedColumn('uuid', { name: 'qa_id' })
  qaId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'email', referencedColumnName: 'email' })
  user: User;

  @Column()
  text: string;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Qa, (qa) => qa.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Qa;

  @OneToMany(() => Qa, (qa) => qa.parent)
  replies: Qa[];
  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;
}
