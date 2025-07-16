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

  @OneToMany(() => ScheduleItem, (item) => item.plan)
  scheduleItems: ScheduleItem[];

  @OneToMany(() => PlanConstraint, (pc) => pc.plan)
  constraints: PlanConstraint[];

  @OneToMany(() => PlanPreference, (pp) => pp.plan)
  preferences: PlanPreference[];
}
