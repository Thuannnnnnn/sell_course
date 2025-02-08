import {
  Body,
  Controller,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Course_purchaseService } from './course_purchase.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
@Controller('api')
export class Course_purchaseController {
  constructor(
    private readonly coursePurchasedService: Course_purchaseService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('course_purchased/create')
  async createCoursePurchased(
    @Body() body: { email: string; courseIds: string[] },
  ) {
    const { email, courseIds } = body;
    if (!email) {
      throw new HttpException('Bad Request', 400);
    }
    if (this.coursePurchasedService.createCoursePurchased(email, courseIds)) {
      throw new HttpException('OK', 200);
    }
    throw new HttpException('Server error', 500);
  }
}
