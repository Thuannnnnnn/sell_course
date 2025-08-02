import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateEnrollmentDto,
  CheckEnrollmentDto,
  UpdateEnrollmentStatusDto,
} from './dto/enrollment.dto';

@Controller('/api/enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
  async createEnrollment(
    @Body() body: CreateEnrollmentDto,
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
    @Body() body: CheckEnrollmentDto,
  ): Promise<{ enrolled: boolean }> {
    const isEnrolled = await this.enrollmentService.checkEnrollment(
      body.userId,
      body.courseId,
    );
    return { enrolled: isEnrolled };
  }

  @Get()
  async getAllEnrollments(): Promise<Enrollment[]> {
    return this.enrollmentService.getAllEnrollments();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
  @Get('my-enrollments')
  async getMyEnrollments(@Req() req: any): Promise<Enrollment[]> {
    const userId = req.user?.user_id || req.user?.id;
    return this.enrollmentService.getEnrollmentsByUser(userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
  @Get('user/:userId')
  async getEnrollmentsByUser(
    @Param('userId') userId: string,
  ): Promise<Enrollment[]> {
    return this.enrollmentService.getEnrollmentsByUser(userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
  @Get(':enrollmentId')
  async getEnrollmentById(
    @Param('enrollmentId') enrollmentId: number,
  ): Promise<Enrollment> {
    return this.enrollmentService.getEnrollmentById(enrollmentId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
  @Put(':enrollmentId')
  async updateEnrollmentStatus(
    @Param('enrollmentId') enrollmentId: number,
    @Body() body: UpdateEnrollmentStatusDto,
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
