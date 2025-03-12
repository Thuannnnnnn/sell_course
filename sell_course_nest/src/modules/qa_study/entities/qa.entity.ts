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
import { ReactionQa } from './reaction_qa.entity';

@Entity('qa_study')
export class QaStudy {
  @PrimaryGeneratedColumn('uuid', { name: 'qa_study_id' })
  qaStudyId: string;

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

  @ManyToOne(() => QaStudy, (qa) => qa.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: QaStudy;

  @OneToMany(() => QaStudy, (qa) => qa.parent)
  replies: QaStudy[];
  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;
  @OneToMany(() => ReactionQa, (reactionQa) => reactionQa.qa)
  reactionQas: ReactionQa[];
}
