import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: 'default-avatar.png' })
  avatarImg: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthDay: string;

  @Column({ type: 'bigint', nullable: true })
  phoneNumber: number;

  @Column()
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @BeforeInsert()
  prePersist() {
    if (!this.user_id) {
      this.user_id = uuidv4();
    }
  }
}
