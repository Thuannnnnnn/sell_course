import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderCode: number;

  @Column()
  amount: number;

  @Column('json', { nullable: true })
  items: any[];

  @Column({ default: 'PENDING' })
  paymentStatus: string;

  @Column({ nullable: true })
  transactionId?: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
