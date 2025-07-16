import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { SurveyAnswer } from '../survey-answer/survey-answer.entity';

@Entity()
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  responseId: string;

  @Column({ type: 'text' })
  responseText: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @OneToMany(() => SurveyAnswer, (answer) => answer.response)
  answers: SurveyAnswer[];
}
