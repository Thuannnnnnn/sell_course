import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { ResultExamService } from './result_exam.service';
import { UserRole } from '../Auth/user.enum';
import { Roles } from '../Auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';

@ApiTags('exam-results')
@Controller('api')
@UseGuards(JwtAuthGuard)
export class ResultExamController {
  constructor(private readonly resultExamService: ResultExamService) {}

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('users/user/submit')
  @ApiOperation({
    summary: 'Submit exam and auto-generate certificate if passing',
  })
  @ApiResponse({
    status: 201,
    description:
      'Exam submitted successfully. Certificate generated if score >= 80%.',
  })
  async submitQuiz(@Request() req, @Body() submitExamDto: SubmitExamDto) {
    const result = await this.resultExamService.submitExam(
      req.user.email,
      submitExamDto,
    );

    // Return additional info about certificate generation
    return {
      ...result,
      message:
        result.score >= 80
          ? 'Exam submitted successfully! Certificate has been generated and sent to your email.'
          : 'Exam submitted successfully! Score must be 80% or higher to earn a certificate.',
    };
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('users/user/results/:courseId')
  @ApiOperation({ summary: 'Get user exam results for specific course' })
  @ApiResponse({
    status: 200,
    description: 'User exam results for the course.',
  })
  async getExamResults(@Request() req, @Param('courseId') courseId: string) {
    return this.resultExamService.getUserExamResults(req.user.email, courseId);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('users/user/results')
  @ApiOperation({ summary: 'Get all user exam results' })
  @ApiResponse({ status: 200, description: 'All user exam results.' })
  async getAllResults(@Request() req) {
    return this.resultExamService.getAllUserExamResults(req.user.email);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('users/user/certificates')
  @ApiOperation({ summary: 'Get all user certificates' })
  @ApiResponse({ status: 200, description: 'All user certificates.' })
  async getUserCertificates(@Request() req) {
    return this.resultExamService.getUserCertificates(req.user.email);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('users/user/questions/:courseId')
  @ApiOperation({ summary: 'Get randomized questions for exam' })
  @ApiResponse({ status: 200, description: 'Randomized exam questions.' })
  async getQuestionsForUser(@Param('courseId') courseId: string) {
    try {
      const questions =
        await this.resultExamService.getQuestionsForUser(courseId);
      return questions;
    } catch {
      throw new NotFoundException('Exam not found');
    }
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('exam/results/all')
  @ApiOperation({ summary: 'Get all exam results (Admin/Instructor only)' })
  @ApiResponse({ status: 200, description: 'All exam results.' })
  async getAllExamResults() {
    try {
      return await this.resultExamService.getAll();
    } catch {
      throw new NotFoundException('Failed to fetch all exam results');
    }
  }
}
