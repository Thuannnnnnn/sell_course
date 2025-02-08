import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { Response, Request } from 'express';
import PayOS from '@payos/node';
import * as crypto from 'crypto';
import { Course_purchaseService } from '../course_purchase/course_purchase.service';
import { PaymentService } from './payment.service';
import { PaymentStatus } from './entities/payment.entity';
@Controller('payment')
export class PaymentController {
  private payOS: PayOS;

  constructor(
    private readonly coursePurchasedService: Course_purchaseService,
    private readonly paymentService: PaymentService,
  ) {
    this.payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY,
    );
  }

  /**
   * API tạo link thanh toán PayOS
   */
  @Post('create-payment-link')
  async createPaymentLink(@Body() body: any, @Res() res: Response) {
    const courseIds = body.items.map((item) => item.courseId).join(',');
    const orderCode = Number(String(Date.now()).slice(-6));

    const paymentData = {
      orderCode,
      amount: body.amount,
      description: body.description,
      items: body.items,
      returnUrl: `${process.env.URL_FE}/${body.lang}/payment/success`,
      cancelUrl: `${process.env.URL_FE}/${body.lang}/payment/failure`,
    };

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
      const secretKey = process.env.PAYOS_CHECKSUM_KEY;
      const dataString = JSON.stringify(req.body);
      const calculatedChecksum = crypto
        .createHmac('sha256', secretKey)
        .update(dataString)
        .digest('hex');
      console.log(req.body);
      const { orderCode, status, amount, items } = req.body;

      if (status === 'PAID') {
        const email = items[0]?.userEmail;
        const courseIds: string[] = items.map(
          (item: { courseId: string }) => item.courseId,
        );

        if (!email) {
          throw new HttpException('User email missing', HttpStatus.BAD_REQUEST);
        }
        await this.coursePurchasedService.createCoursePurchased(
          email,
          courseIds,
        );
      }

      return res.status(200).json({ message: 'Webhook received' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
