import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity'; // Đảm bảo đường dẫn đúng
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

  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable({
    name: 'user_permissions', // Bảng trung gian lưu trữ quyền của người dùng
    joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[]; // Danh sách quyền của người dùng

  @Column()
  role: string;

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
}
