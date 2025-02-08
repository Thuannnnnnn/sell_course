import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { Response } from 'express';

@Controller('order')
export class OrderController {
  // constructor(private readonly orderService: OrderService) {}
  // // 🔹 Tạo Payment Link & lưu đơn hàng
  // @Post('create-payment-link')
  // async createPaymentLink(@Body() body: any, @Res() res: Response) {
  //   const orderCode = Number(String(Date.now()).slice(-6));
  //   // Lưu đơn hàng vào DB trước khi thanh toán
  //   await this.orderService.createOrder({
  //     orderCode,
  //     amount: body.amount,
  //     items: body.items,
  //     paymentStatus: 'PENDING',
  //   });
  //   const paymentData = {
  //     orderCode,
  //     amount: body.amount,
  //     description: body.description,
  //     returnUrl: `${process.env.URL_FE}/${body.lang}/payment/success`,
  //     cancelUrl: `${process.env.URL_FE}/${body.lang}/payment/failure`,
  //   };
  //   try {
  //     const paymentLinkResponse =
  //       await this.payOS.createPaymentLink(paymentData);
  //     return res.json(paymentLinkResponse);
  //   } catch (error) {
  //     console.error('Error creating payment link:', error);
  //     return res.status(500).json({ message: 'Something went wrong' });
  //   }
  // }
  // // 🔹 Xử lý webhook từ PayOS
  // @Post('payment/webhook')
  // async handlePaymentWebhook(@Body() body: any, @Res() res: Response) {
  //   console.log('Received webhook:', body);
  //   try {
  //     if (body.code === '00' && body.success) {
  //       await this.orderService.updateOrderStatus(body.data.orderCode, {
  //         paymentStatus: 'PAID',
  //         transactionId: body.data.reference,
  //       });
  //       console.log(`✅ Order ${body.data.orderCode} updated to PAID`);
  //     }
  //     return res.status(200).json({ message: 'Webhook received' });
  //   } catch (error) {
  //     console.error('Error processing webhook:', error);
  //     return res.status(500).json({ message: 'Internal server error' });
  //   }
  // }
  // // 🔹 Lấy thông tin đơn hàng theo orderCode
  // @Get(':orderCode')
  // async getOrder(@Param('orderCode') orderCode: number) {
  //   return this.orderService.findByOrderCode(orderCode);
  // }
}
