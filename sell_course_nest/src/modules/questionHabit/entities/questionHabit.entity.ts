import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('questionHabit')
export class QuestionHabit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;
}
