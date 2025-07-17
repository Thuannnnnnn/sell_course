import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { User } from '../../user/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  messageText: string;

  @Column()
  timestamp: Date;

  @ManyToOne(() => ChatSession, (chatSession) => chatSession.messages)
  chatSession: ChatSession;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;
}
