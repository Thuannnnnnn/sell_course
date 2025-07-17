import { Controller, Post, Body, Res, Req, Get, Query } from '@nestjs/common';
import { Response, Request } from 'express';
import PayOS from '@payos/node';
import { PaymentStatus } from './entities/payment.entity';
import { CourseService } from '../course/course.service';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Controller('payment')
export class PaymentController {
  private payOS: PayOS;
  orderService: any;

  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly courseService: CourseService,
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
    const course = await this.courseService.getCourseById(body.courseId);
    console.log(course.price);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (body.amount <= 0) {
      return res
        .status(400)
        .json({ message: 'Amount must be greater than zero' });
    }
    if (!body.email || !body.email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (!process.env.URL_FE) {
      return res
        .status(500)
        .json({ message: 'Frontend URL is not configured' });
    }
    if (
      !process.env.PAYOS_CLIENT_ID ||
      !process.env.PAYOS_API_KEY ||
      !process.env.PAYOS_CHECKSUM_KEY
    ) {
      return res
        .status(500)
        .json({ message: 'PayOS configuration is missing' });
    }
    await this.enrollmentService.createEnrollment(
      orderCode,
      body.userId,
      body.courseId,
      PaymentStatus.PENDING,
    );
    const paymentData = {
      orderCode,
      amount: course.price,
      description: `Payment for order ${orderCode}`,
      courseId: body.courseId,
      returnUrl: `${process.env.URL_FE}/payment/success`,
      cancelUrl: `${process.env.URL_FE}/payment/failure`,
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
      const { success, data } = req.body;
      if (data.orderCode === 123) {
        return res.status(200).json({ message: 'PayOS connect successful' });
      }

      if (!data.orderCode) {
        return res.status(400).json({ message: 'Invalid order code' });
      }

      if (success) {
        await this.enrollmentService.updateEnrollmentStatus(
          data.orderCode,
          PaymentStatus.PAID,
        );
      } else {
        await this.enrollmentService.updateEnrollmentStatus(
          data.orderCode,
          PaymentStatus.CANCELLED,
        );
      }

      return res.status(200).json({ message: 'Webhook received' });
    } catch (error) {
      console.error('Error in webhook:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Get('check-payment-status')
  async checkPaymentStatus(
    @Query('orderCode') orderCode: number,
    @Res() res: Response,
  ) {
    try {
      const enroll = await this.enrollmentService.getEnrollmentById(orderCode);
      if (!enroll) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.json({ paymentStatus: enroll.status });
    } catch (error) {
      console.error('Error checking payment status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
