import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LearningPlan } from '../learning-plan/learning-plan.entity';

@Entity()
export class PlanPreference {
  @PrimaryGeneratedColumn('uuid')
  preferenceId: string;

  @ManyToOne(() => LearningPlan, (plan) => plan.preferences, {
    onDelete: 'CASCADE',
  })
  plan: LearningPlan;

  @Column()
  type: string; // e.g. 'preferred_time'

  @Column()
  value: string; // e.g. 'morning'

  @Column()
  weight: number;
}

