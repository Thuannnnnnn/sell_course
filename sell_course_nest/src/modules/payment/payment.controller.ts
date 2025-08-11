import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import PayOS from '@payos/node';
import { PaymentStatus } from './entities/payment.entity';
import { CourseService } from '../course/course.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { PromotionService } from '../promotion/promotion.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { RolesGuard } from '../Auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('payment')
export class PaymentController {
  private payOS: PayOS;
  orderService: any;

  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly courseService: CourseService,
    private readonly promotionService: PromotionService,
  ) {
    this.payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY,
    );
  }
  // @ApiBearerAuth('Authorization')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create-payment-link')
  async createPaymentLink(
    @Body() body: CreatePaymentLinkDto,
    @Res() res: Response,
  ) {
    const orderCode = Number(String(Date.now()).slice(-6));
    const course = await this.courseService.getCourseById(body.courseId);
    console.log(course.price);
    console.log(body.courseId);
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

    // Calculate final price with promotion discount
    let finalPrice = course.price;
    let promotionDetails = null;

    // Helper to ensure integer amount (PayOS requires integer > 0)
    const toIntegerAmount = (value: number) => {
      if (!Number.isFinite(value)) return 0;
      return Math.round(value); // round to nearest VND
    };

    if (body.promotionCode) {
      try {
        const promotion = await this.promotionService.validatePromotionCode(
          body.promotionCode,
          body.courseId,
        );

        // Check if promotion is active
        if (promotion.status === 'active') {
          // Check if promotion applies to this course (if course-specific)
          if (
            !promotion.course ||
            promotion.course.courseId === body.courseId
          ) {
            // Compute discount using integer arithmetic to avoid float precision issues
            const rawDiscountAmount = (course.price * promotion.discount) / 100;
            const discountAmount = toIntegerAmount(rawDiscountAmount);
            finalPrice = toIntegerAmount(course.price - discountAmount);
            promotionDetails = {
              id: promotion.id,
              name: promotion.name,
              discount: promotion.discount,
              discountAmount: discountAmount,
              originalPrice: course.price,
              finalPrice: finalPrice,
            };
          } else {
            return res.status(400).json({
              message: 'Promotion is not applicable to this course',
            });
          }
        } else if (promotion.status === 'expired') {
          return res.status(400).json({
            message: 'Promotion has expired',
          });
        } else if (promotion.status === 'pending') {
          return res.status(400).json({
            message: 'Promotion is not yet active',
          });
        }
      } catch (error) {
        console.error('Error fetching promotion:', error);
        return res.status(404).json({
          message: 'Promotion not found',
        });
      }
    }

    await this.enrollmentService.createEnrollment(
      orderCode,
      body.userId,
      body.courseId,
      PaymentStatus.PENDING,
    );
    console.log(finalPrice);
    console.log(body.courseId);
    console.log(orderCode);

    // Ensure finalPrice is an integer (in case no promotion or already integer)
    finalPrice = toIntegerAmount(finalPrice);
    if (finalPrice <= 0) {
      return res
        .status(400)
        .json({ message: 'Final amount must be greater than zero' });
    }

    // Prepare payment data for PayOS
    const paymentData = {
      orderCode,
      amount: finalPrice, // integer amount
      description: `Order ${orderCode}`,
      returnUrl: `${process.env.URL_FE}/payment/success?orderCode=${orderCode}&courseId=${body.courseId}`,
      cancelUrl: `${process.env.URL_FE}/payment/failure?orderCode=${orderCode}&courseId=${body.courseId}`,
      items: [
        {
          name: course.title,
          quantity: 1,
          price: finalPrice, // integer price
        },
      ],
      // If PayOS supports extra data, you can add one of these (uncomment the appropriate one):
      // metadata: { courseId: body.courseId },
      // extraData: body.courseId,
    };
    try {
      const paymentLinkResponse =
        await this.payOS.createPaymentLink(paymentData);

      // Include promotion details in response
      const response = {
        ...paymentLinkResponse,
        promotionDetails: promotionDetails,
      };

      return res.json(response);
    } catch (error) {
      console.error('Error creating payment link:', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
  // @ApiBearerAuth('Authorization')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('validate-promotion')
  async validatePromotion(
    @Body() body: ValidatePromotionDto,
    @Res() res: Response,
  ) {
    try {
      if (!body.promotionId) {
        return res.status(400).json({ message: 'Promotion ID is required' });
      }

      const promotion = await this.promotionService.findById(body.promotionId);
      const course = await this.courseService.getCourseById(body.courseId);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if promotion is active
      if (promotion.status === 'active') {
        // Check if promotion applies to this course (if course-specific)
        if (!promotion.course || promotion.course.courseId === body.courseId) {
          const discountAmount = (course.price * promotion.discount) / 100;
          const finalPrice = course.price - discountAmount;

          return res.json({
            valid: true,
            promotion: {
              id: promotion.id,
              name: promotion.name,
              discount: promotion.discount,
              discountAmount: discountAmount,
              originalPrice: course.price,
              finalPrice: finalPrice,
            },
          });
        } else {
          return res.status(400).json({
            valid: false,
            message: 'Promotion is not applicable to this course',
          });
        }
      } else if (promotion.status === 'expired') {
        return res.status(400).json({
          valid: false,
          message: 'Promotion has expired',
        });
      } else if (promotion.status === 'pending') {
        return res.status(400).json({
          valid: false,
          message: 'Promotion is not yet active',
        });
      }
    } catch (error) {
      console.error('Error validating promotion:', error);
      return res.status(404).json({
        valid: false,
        message: 'Promotion not found',
      });
    }
  }
}
