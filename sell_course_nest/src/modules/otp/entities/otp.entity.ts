import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('otps')
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false, length: 6 })
  otp_code: string;

  @Column({ nullable: false })
  purpose: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: false })
  expiredAt: Date;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ name: 'resend_count', type: 'int', default: 0 })
  resendCount: number;

  @Column({ name: 'last_resend_at', type: 'timestamp', nullable: true })
  lastResendAt: Date;

  constructor(
    email: string,
    otp_code: string,
    purpose: string,
    createdAt: Date,
    expiredAt: Date,
  ) {
    this.email = email;
    this.otp_code = otp_code;
    this.purpose = purpose;
    this.createdAt = createdAt;
    this.expiredAt = expiredAt;
    this.isUsed = false;
    this.resendCount = 0;
  }
}
