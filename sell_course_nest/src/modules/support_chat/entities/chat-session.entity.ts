import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from '../../user/entities/user.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startTime: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  lastNotificationSent: Date;

  @OneToMany(() => Message, (message) => message.chatSession)
  messages: Message[];

  @ManyToOne(() => User, (user) => user.chatSessions)
  user: User;
}
