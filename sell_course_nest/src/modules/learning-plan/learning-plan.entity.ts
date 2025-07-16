import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { ScheduleItem } from '../schedule_item/entities/schedule_item.entity';
import { PlanConstraint } from '../plan-constraint/plan-constraint.entity';
import { PlanPreference } from '../plan-preference/plan-preference.entity';

@Entity()
export class LearningPlan {
  @PrimaryGeneratedColumn('uuid')
  planId: string;

  @ManyToOne(() => User, (user) => user.plans)
  user: User;

  @Column()
  studyGoal: string;

  @Column()
  totalWeeks: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @OneToMany(() => ScheduleItem, (item) => item.plan, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  scheduleItems: ScheduleItem[];

  @OneToMany(() => PlanConstraint, (pc) => pc.plan, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  constraints: PlanConstraint[];

  @OneToMany(() => PlanPreference, (pp) => pp.plan, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  preferences: PlanPreference[];
  // ✅ Add narrativeTemplates JSON field
  @Column({ type: 'jsonb', nullable: true })
  narrativeTemplates: any;
}
