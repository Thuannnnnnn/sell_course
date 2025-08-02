import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  user_id: string;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  is_revoked: boolean;
}
