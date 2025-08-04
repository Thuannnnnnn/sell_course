import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { PlanConstraint } from '../plan-constraint/plan-constraint.entity';
import { PlanPreference } from '../plan-preference/plan-preference.entity';

@Entity()
export class LearningPlan {
  @PrimaryGeneratedColumn('uuid')
  planId: string;

  @ManyToOne(() => User, (user) => user.plans)
  user: User;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  order: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Store the target learning path data from user input
  @Column({ type: 'jsonb', nullable: true })
  targetLearningPath: {
    topic: string;
    learning_goal: string;
    target_level: string;
    current_level: string;
    has_prior_knowledge: boolean;
    desired_duration: string;
    preferred_learning_styles: string[];
    learning_order: string;
    output_expectations: {
      want_progress_tracking: boolean;
      want_mentor_or_AI_assist: boolean;
      post_learning_outcome: string;
    };
    userId: string;
    userName: string;
  };

  // Store the learning path courses data from n8n response
  @Column({ type: 'jsonb', nullable: true })
  learningPathCourses: {
    courseId: string;
    title: string;
    narrativeText: Array<{
      template: string;
      bindings: Record<string, any>;
    }>;
    lessons: Array<{
      lessonId: string;
      title: string;
      narrativeText: Array<{
        template: string;
        bindings: Record<string, any>;
      }>;
      contents: Array<{
        contentId: string;
        type: string;
        title: string;
        durationMin: number;
        narrativeText: Array<{
          template: string;
          bindings: Record<string, any>;
        }>;
      }>;
    }>;
  }[];

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

  // Optional: Keep course reference for backward compatibility
  @ManyToOne(() => Course, { nullable: true })
  course: Course;
}

