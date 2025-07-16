import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LearningPlan } from '../learning-plan/learning-plan.entity';

@Entity()
export class PlanConstraint {
  @PrimaryGeneratedColumn('uuid')
  constraintId: string;

  @ManyToOne(() => LearningPlan, (plan) => plan.constraints, {
    onDelete: 'CASCADE',
  })
  plan: LearningPlan;

  @Column()
  type: string; // e.g. 'max_hours_per_day'

  @Column()
  key: string; // e.g. '6' (Sat)

  @Column()
  value: string; // e.g. '18:00'
}
