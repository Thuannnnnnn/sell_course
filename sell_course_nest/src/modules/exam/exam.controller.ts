import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Put,
  Delete,
} from '@nestjs/common';
import { ExamQuestionService } from './exam.service';
import { CreateExamDto } from './dto/createExamData.dto';
// import { UpdateExamDto } from './dto/updateExamData.dto';
import { UpdateQuestionDto } from './dto/updateQuestionData.dto';

@Controller('api')
export class ExamQuestionController {
  constructor(private readonly examQuestionService: ExamQuestionService) {}
  @Post('/admin/exam/create_exam')
  async createExamQuestions(@Body() dto: CreateExamDto) {
    return this.examQuestionService.createExam(dto);
  }
  @Get('/admin/exam/view_exam/:id')
  async getAllExamById(@Param('id') examId: string) {
    const exam = await this.examQuestionService.getExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }
    return exam;
  }
  @Delete('/admin/exam/delete_question/:id')
  async deleteQuestion(@Param('id') questionId: string) {
    return this.examQuestionService.deleteQuestion(questionId);
  }
  @Delete('/admin/exam/delete_exam/:id')
  async deleteExam(@Param('id') examId: string) {
    return this.examQuestionService.deleteExam(examId);
  }
  @Get('/admin/exam/view_question/:id')
  async getQuestionById(@Param('id') questionId: string) {
    return this.examQuestionService.getQuestionById(questionId);
  }
  @Put('/admin/exam/update_question/:id')
  async updateQuestion(
    @Param('id') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.examQuestionService.updateQuestion(questionId, dto);
  }
}
