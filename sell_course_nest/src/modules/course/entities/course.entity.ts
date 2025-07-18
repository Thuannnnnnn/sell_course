import { Category } from '../../category/entities/category.entity';
import { Interaction } from '../../Interaction/entities/Interaction.entity';
import { Notify } from '../../notify/entities/notify.entity';
import { User } from '../../user/entities/user.entity';
import { Waitlist } from '../../waitlist/entities/waitlist.entity';
import { Promotion } from '../../promotion/entities/promotion.entity';
import { Certificate } from '../../certificate/entities/certificate.entity';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { LearningPlan } from 'src/modules/learning-plan/learning-plan.entity';
import { CourseStatus } from '../enums/course-status.enum';

@Entity('course')
export class Course {
  @PrimaryColumn({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  instructor: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', name: 'short_description' })
  short_description: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar', name: 'video_intro', nullable: true })
  videoIntro: string;

  @Column({ type: 'varchar' })
  thumbnail: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'varchar' })
  skill: string;

  @Column({ type: 'varchar' })
  level: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Interaction, (interaction) => interaction.course)
  interactions: Interaction[];

  @OneToMany(() => Notify, (notify) => notify.course)
  notifies: Notify[];

  @OneToMany(() => Waitlist, (waitlist) => waitlist.user)
  waitlists: Waitlist[];

  @OneToMany(() => Promotion, (promotion) => promotion.course)
  promotions: Promotion[];

  @OneToMany(() => Certificate, (certificate) => certificate.course)
  certificates: Certificate[];

  @OneToMany(() => LearningPlan, (learningPlan) => learningPlan.course)
  learningPlan: LearningPlan[];

  @BeforeInsert()
  prePersist() {
    if (!this.courseId) {
      this.courseId = uuidv4();
    }
  }
  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
