import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { Contents } from '../../contents/entities/contents.entity';

@Entity('exam')
export class Exam {
  @PrimaryColumn({ name: 'exam_id' })
  examId: string;

  @OneToOne(() => Contents)
  @JoinColumn({ name: 'content_id' })
  contents: Contents;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
