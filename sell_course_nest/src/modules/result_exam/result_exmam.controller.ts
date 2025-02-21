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

@Controller('api')
@UseGuards(JwtAuthGuard)
export class ResultExamController {
  constructor(private readonly resultExamService: ResultExamService) {}

  @Post('users/user/submit')
  async submitQuiz(@Request() req, @Body() submitExamDto: SubmitExamDto) {
    return this.resultExamService.submitExam(req.user.email, submitExamDto);
  }

  @Get('users/user/results/:examId')
  async getExamResults(@Request() req, @Param('examId') examId: string) {
    return this.resultExamService.getUserExamResults(req.user.email, examId);
  }

  @Get('users/user/results')
  async getAllResults(@Request() req) {
    return this.resultExamService.getAllUserExamResults(req.user.email);
  }

  @Get('users/user/questions/:examId')
  async getQuestionsForUser(@Param('examId') examId: string) {
    try {
      const questions =
        await this.resultExamService.getQuestionsForUser(examId);
      return questions;
    } catch {
      throw new NotFoundException('Exam not found');
    }
  }
}
