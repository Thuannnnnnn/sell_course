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
import { UserNotify } from '../../User_Notify/entities/User_Notify.entity';
import { Forum } from '../../forum/entities/forum.entity';
import { Waitlist } from '../../waitlist/entities/waitlist.entity';
import { ReactionTopic } from '../../forum/entities/reaction_topic.entity';
import { Discussion } from '../../forum/entities/discussion.entity';
import { ReactionQa } from '../../qa_study/entities/reaction_qa.entity';
import { Certificate } from '../../certificate/entities/certificate.entity';
import { Interaction } from '../../Interaction/entities/Interaction.entity';
import { UserAnswer } from '../../userAnswer/entities/userAnswer.entity';
import { ChatSession } from '../../support_chat/entities/chat-session.entity';
import { Message } from '../../support_chat/entities/message.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { LearningPlan } from 'src/modules/learning-plan/learning-plan.entity';
import { SurveyAnswer } from 'src/modules/survey-answer/survey-answer.entity';
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

  @OneToMany(() => Interaction, (interaction) => interaction.user)
  interactions: Interaction[];

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.user)
  userAnswer: UserAnswer[];

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
  @OneToMany(() => UserNotify, (userNotify) => userNotify.user)
  userNotifies: UserNotify[];
  @OneToMany(() => Forum, (forum) => forum.user)
  forums: Forum[];
  @OneToMany(() => Waitlist, (waitlist) => waitlist.user)
  waitlists: Waitlist[];
  @OneToMany(() => ReactionTopic, (reactionTopic) => reactionTopic.user)
  reactionTopics: ReactionTopic[];
  @OneToMany(() => Discussion, (discussion) => discussion.user)
  discussions: Discussion[];
  @OneToMany(() => ReactionQa, (reactionQa) => reactionQa.user)
  reactionQa: ReactionTopic[];
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

  @OneToMany(() => SurveyAnswer, (answer) => answer.user)
  surveyAnswers: SurveyAnswer[];
}
