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
import { UserNotify } from 'src/modules/User_Notify/entities/user_Notify.entity';
import { Forum } from 'src/modules/forum/entities/forum.entity';
import { Waitlist } from 'src/modules/waitlist/entities/waitlist.entity';
import { ReactionTopic } from 'src/modules/forum/entities/reaction_topic.entity';
import { Discussion } from 'src/modules/forum/entities/discussion.entity';
import { ReactionQa } from 'src/modules/qa_study/entities/reaction_qa.entity';
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
}
