/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './entities/enrollment.entity';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  async createEnrollment(
    @Body()
    body: {
      enrollmentId: number;
      userId: string;
      courseId: string;
      status: string;
    },
  ): Promise<Enrollment> {
    return this.enrollmentService.createEnrollment(
      body.enrollmentId,
      body.userId,
      body.courseId,
      body.status,
    );
  }

  @Post('check')
  async checkEnrollment(
    @Body()
    body: {
      userId: string;
      courseId: string;
    },
  ): Promise<{ enrolled: boolean }> {
    const isEnrolled = await this.enrollmentService.checkEnrollment(
      body.userId,
      body.courseId,
    );
    return { enrolled: isEnrolled };
  }

  @Get(':enrollmentId')
  async getEnrollmentById(
    @Param('enrollmentId') enrollmentId: number,
  ): Promise<Enrollment> {
    return this.enrollmentService.getEnrollmentById(enrollmentId);
  }

  @Get()
  async getAllEnrollments(): Promise<Enrollment[]> {
    return this.enrollmentService.getAllEnrollments();
  }

  @Put(':enrollmentId')
  async updateEnrollmentStatus(
    @Param('enrollmentId') enrollmentId: number,
    @Body() body: { status: string },
  ): Promise<Enrollment> {
    return this.enrollmentService.updateEnrollmentStatus(
      enrollmentId,
      body.status,
    );
  }

  @Delete(':enrollmentId')
  async deleteEnrollment(
    @Param('enrollmentId') enrollmentId: number,
  ): Promise<void> {
    return this.enrollmentService.deleteEnrollment(enrollmentId);
  }
}
