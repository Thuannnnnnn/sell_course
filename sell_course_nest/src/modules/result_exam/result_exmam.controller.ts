import {
  Controller,
  Post,
  Body,
  Get,
  Param,
//   UseGuards,
  Request,
} from '@nestjs/common';
// import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { ResultExamService } from './result_exam.service';

@Controller('api')
// @UseGuards(JwtAuthGuard)
export class QuizzStoreController {
  constructor(private readonly resultExamService: ResultExamService) {}

  @Post('users/user/submit')
  async submitQuiz(@Request() req, @Body() submitExamDto: SubmitExamDto) {
    return this.resultExamService.submitExam(req.user.userId, submitExamDto);
  }

  @Get('users/user/results/:examId')
  async getQuizResults(@Request() req, @Param('examId') examId: string) {
    return this.resultExamService.getUserExamResults(req.user.userId, examId);
  }

  @Get('users/user/results')
  async getAllResults(@Request() req) {
    return this.resultExamService.getAllUserExamResults(req.user.userId);
  }
}
