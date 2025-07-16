import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SurveyResponse } from '../survey-response/survey-response.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';

@Entity()
export class SurveyAnswer {
  @PrimaryGeneratedColumn('uuid')
  surveyAnswerId: string;

  @Column({ type: 'text' })
  answerText: string;

  @ManyToOne(() => SurveyResponse, (response) => response.answers)
  response: SurveyResponse;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @ManyToOne(() => User, (user) => user.surveyAnswers)
  user: User;
}
