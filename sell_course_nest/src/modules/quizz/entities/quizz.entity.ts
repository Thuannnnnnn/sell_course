import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Contents } from '../../contents/entities/contents.entity';

@Entity('quizz')
export class Quizz {
  @PrimaryColumn({ name: 'quizz_id' })
  quizzId: string;

  @ManyToOne(() => Contents)
  @JoinColumn({ name: 'content_id' })
  contents: Contents;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
