import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MeetingParticipant } from './meeting-participant.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  hostId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hostId' })
  host: User;

  @CreateDateColumn()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isRecorded: boolean;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ default: false })
  isScheduled: boolean;

  @Column({ nullable: true })
  scheduledTime: Date;

  @Column({ unique: true })
  meetingCode: string;

  @OneToMany(() => MeetingParticipant, (participant) => participant.meeting)
  participants: MeetingParticipant[];
}
