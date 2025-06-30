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
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { ResultExamService } from './result_exam.service';
// jjjjj
@Controller('api')
@UseGuards(JwtAuthGuard)
export class ResultExamController {
  constructor(private readonly resultExamService: ResultExamService) {}

  @Post('users/user/submit')
  async submitQuiz(@Request() req, @Body() submitExamDto: SubmitExamDto) {
    return this.resultExamService.submitExam(req.user.email, submitExamDto);
  }

  @Get('users/user/results/:courseId')
  async getExamResults(@Request() req, @Param('courseId') courseId: string) {
    return this.resultExamService.getUserExamResults(req.user.email, courseId);
  }

  @Get('users/user/results')
  async getAllResults(@Request() req) {
    return this.resultExamService.getAllUserExamResults(req.user.email);
  }

  @Get('users/user/questions/:courseId')
  async getQuestionsForUser(@Param('courseId') courseId: string) {
    try {
      const questions =
        await this.resultExamService.getQuestionsForUser(courseId);
      return questions;
    } catch {
      throw new NotFoundException('Exam not found');
    }
  }
  @Get('exam/results/all')
  async getAllExamResults() {
    try {
      return await this.resultExamService.getAll();
    } catch {
      throw new NotFoundException('Failed to fetch all exam results');
    }
  }
}
