import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import PayOS from '@payos/node';
import { PaymentStatus } from './entities/payment.entity';
import { OrderService } from '../order/order.service';
import { Course_purchaseService } from '../course_purchase/course_purchase.service';
@Controller('payment')
export class PaymentController {
  private payOS: PayOS;

  constructor(
    private readonly coursePurchasedService: Course_purchaseService,
    private readonly orderService: OrderService,
  ) {
    this.payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY,
    );
  }
  @Post('create-payment-link')
  async createPaymentLink(@Body() body: any, @Res() res: Response) {
    const orderCode = Number(String(Date.now()).slice(-6));
    const paymentData = {
      orderCode,
      amount: body.amount,
      description: body.description,
      items: body.items,
      returnUrl: `${process.env.URL_FE}/${body.lang}/payment/success`,
      cancelUrl: `${process.env.URL_FE}/${body.lang}/payment/failure`,
    };
    await this.orderService.createOrder({
      orderCode,
      amount: body.amount,
      items: body.items,
      paymentStatus: PaymentStatus.PENDING,
      email: body.email,
    });
    try {
      const paymentLinkResponse =
        await this.payOS.createPaymentLink(paymentData);
      return res.json(paymentLinkResponse);
    } catch (error) {
      console.error('Error creating payment link:', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const { success, data } = req.body;
      if (success) {
        await this.orderService.updateOrderStatus(data.orderCode, {
          paymentStatus: PaymentStatus.PAID,
          transactionId: data.reference,
        });
        const order = await this.orderService.findByOrderCode(data.orderCode);
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        const courseIds = order.items.map((item) => item.courseId);
        const email = order.email;
        if (courseIds.length > 0 && email) {
          await this.coursePurchasedService.createCoursePurchased(
            email,
            courseIds,
          );
        }
      }
      return res.status(200).json({ message: 'Webhook received' });
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
