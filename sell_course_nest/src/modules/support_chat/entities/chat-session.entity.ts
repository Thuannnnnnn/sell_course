import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  startTime: Date;
}
