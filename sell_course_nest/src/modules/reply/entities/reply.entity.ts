import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Qa } from '../../qa/entities/qa.entity';

@Entity('reply')
export class Reply {
  @PrimaryColumn({ name: 'id' })
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Qa)
  @JoinColumn({ name: 'qa_id' })
  qa: Qa;

  @Column()
  text: string;
}
