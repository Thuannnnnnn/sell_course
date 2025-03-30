import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Meeting } from './meeting.entity';

@Entity('meeting_messages')
export class MeetingMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  meetingId: string;

  @ManyToOne(() => Meeting)
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  message: string;

  @Column()
  timestamp: Date;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ nullable: true })
  receiverId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;
}
