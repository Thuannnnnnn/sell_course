import { Course } from "src/modules/course/entities/course.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Interaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.interactions)
  student: Student;

  @ManyToOne(() => Course, (course) => course.interactions)
  course: Course;

  @Column({ default: 1 })
  interest_score: number; // Representing student's interest
}
