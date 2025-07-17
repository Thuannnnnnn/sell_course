import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  responseId: string;

  @Column({ type: 'text' })
  responseText: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}
