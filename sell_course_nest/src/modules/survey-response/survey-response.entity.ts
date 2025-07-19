import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SurveyAnswerOption } from '../surveyAnswerOption/survey-answer-option.entity';

@Entity()
export class SurveyQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionText: string;

  @Column()
  type: 'single' | 'multiple' | 'text';

  @Column({ default: true })
  required: boolean;

  @OneToMany(() => SurveyAnswerOption, (option) => option.question, {
    cascade: true, // Nếu muốn tự động lưu options khi lưu question
  })
  options: SurveyAnswerOption[];
}
