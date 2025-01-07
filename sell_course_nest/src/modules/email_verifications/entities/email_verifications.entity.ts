import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  token: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: false })
  expiredAt: Date;

  constructor(email: string, token: string, createdAt: Date, expiredAt: Date) {
    this.email = email;
    this.token = token;
    this.createdAt = createdAt;
    this.expiredAt = expiredAt;
  }
}
