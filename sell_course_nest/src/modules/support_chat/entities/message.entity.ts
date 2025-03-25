import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  sender: string;

  @Column()
  messageText: string;

  @Column()
  timestamp: Date;
}
