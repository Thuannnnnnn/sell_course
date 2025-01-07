import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('qa')
export class Qa {
  @PrimaryColumn({ name: 'qa_id' })
  qaId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  text: string;

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
