import { Controller, Post, Body, Res } from '@nestjs/common';
import PayOS from '@payos/node';
import { Response } from 'express';
@Controller('payment')
export class PaymentController {
  private payOS: PayOS;

  constructor() {
    this.payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY,
    );
  }

  @Post('create-embedded-payment-link')
  async createPaymentLink(@Body() body: any, @Res() res: Response) {
    const YOUR_DOMAIN = 'http://localhost:8080';
    const paymentData = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: body.amount,
      description: body.description,
      items: body.items,
      returnUrl: body.returnUrl || YOUR_DOMAIN,
      cancelUrl: body.cancelUrl || YOUR_DOMAIN,
    };

    try {
      const paymentLinkResponse =
        await this.payOS.createPaymentLink(paymentData);
      return res.json(paymentLinkResponse);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
}
