import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';
import { v4 as uuidv4 } from 'uuid';

import { ChatSession } from '../../support_chat/entities/chat-session.entity';
import { Message } from '../../support_chat/entities/message.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { LearningPlan } from 'src/modules/learning-plan/learning-plan.entity';
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatarImg: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthDay: string;

  @Column({ type: 'bigint', nullable: true })
  phoneNumber: number;

  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
  @Column()
  role: string;

  @Column({ default: false })
  isOAuth: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  @Column({ default: false })
  isBan: boolean;
  @BeforeInsert()
  prePersist() {
    if (!this.user_id) {
      this.user_id = uuidv4();
    }
  }
  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];
  @OneToMany(() => ChatSession, (chatSession) => chatSession.user)
  chatSessions: ChatSession[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => LearningPlan, (plan) => plan.user)
  plans: LearningPlan[];
}
