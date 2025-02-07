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
  //   @UseGuards(JwtAuthGuard)
  @Post('course_purchased/create')
  async createCoursePurchased(
    @Body() body: { user_id: string; course_id: string },
  ) {
    const { user_id, course_id } = body;
    if (!user_id || !course_id) {
      throw new HttpException('Bad Request', 400);
    }
    if (this.coursePurchasedService.createCoursePurchased(user_id, course_id)) {
      throw new HttpException('OK', 200);
    }
    throw new HttpException('Server error', 500);
  }
}
