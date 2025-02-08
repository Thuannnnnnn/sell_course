import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  // constructor(
  //   @InjectRepository(Payment)
  //   private readonly paymentRepository: Repository<Payment>,
  // ) {}
  // async createPayment(
  //   userId: number,
  //   orderCode: string,
  //   amount: number,
  // ): Promise<Payment> {
  //   const payment = this.paymentRepository.create({
  //     userId,
  //     orderCode,
  //     amount,
  //     status: PaymentStatus.PENDING,
  //   });
  //   return this.paymentRepository.save(payment);
  // }
  // async updatePaymentStatus(
  //   orderCode: string,
  //   status: PaymentStatus,
  //   transactionReference?: string,
  // ) {
  //   const payment = await this.paymentRepository.findOne({
  //     where: { orderCode },
  //   });
  //   if (!payment) {
  //     throw new Error('Payment record not found');
  //   }
  //   payment.status = status;
  //   return this.paymentRepository.save(payment);
  // }
  // async cancelPayment(orderCode: string) {
  //   await this.paymentRepository.delete({ orderCode });
  // }
}
