import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
  @Delete(':enrollmentId')
  async deleteEnrollment(
    @Param('enrollmentId') enrollmentId: number,
  ): Promise<void> {
    return this.enrollmentService.deleteEnrollment(enrollmentId);
  }
}
