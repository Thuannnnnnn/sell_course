import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Meeting } from './meeting.entity';

@Entity('meeting_participants')
export class MeetingParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  meetingId: string;

  @ManyToOne(() => Meeting, (meeting) => meeting.participants)
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  joinTime: Date;

  @Column({ nullable: true })
  leaveTime: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  hasCamera: boolean;

  @Column({ default: false })
  hasMicrophone: boolean;

  @Column({ default: false })
  isScreenSharing: boolean;

  @Column({
    type: 'enum',
    enum: ['host', 'participant'],
    default: 'participant',
  })
  role: 'host' | 'participant'; // Thêm trường role
}
