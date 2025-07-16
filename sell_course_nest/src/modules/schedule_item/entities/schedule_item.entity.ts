import { Course } from 'src/modules/course/entities/course.entity';
import { LearningPlan } from 'src/modules/learning-plan/learning-plan.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class ScheduleItem {
  @PrimaryGeneratedColumn('uuid')
  itemId: string;

  @ManyToOne(() => LearningPlan, (plan) => plan.scheduleItems)
  plan: LearningPlan;

  @ManyToOne(() => Course, (course) => course.courseId)
  course: Course;

  @Column()
  dayOfWeek: number; // 1-7

  @Column({ type: 'time' })
  startTime: string;

  // ✅ Thêm ngày học cụ thể
  @Column({ type: 'date' })
  scheduledDate: string;

  @Column()
  durationMin: number;

  // (Tuỳ chọn - nếu hiển thị theo tuần)
  @Column({ nullable: true })
  weekNumber: number;

  @Column({ type: 'uuid', array: true })
  contentIds: string[];
}
