import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SurveyQuestion } from '../survey-response/survey-response.entity';

@Entity()
export class SurveyAnswerOption {
  @PrimaryGeneratedColumn('uuid')
  optionId: string;

  @Column()
  text: string;

  @ManyToOne(() => SurveyQuestion, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  question: SurveyQuestion;
}
