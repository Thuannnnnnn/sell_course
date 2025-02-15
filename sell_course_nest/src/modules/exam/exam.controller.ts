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

  @Post('/exam')
  async createExamQuestions(@Body() dto: CreateExamDto) {
    return this.examQuestionService.createExam(dto);
  }

  @Get('/exam/:id')
  async getAllExamById(@Param('id') examId: string) {
    const exam = await this.examQuestionService.getExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }
    return exam;
  }

  // @Put('/exam/:id')
  // async updateExam(@Param('id') examId: string, @Body() dto: UpdateExamDto) {
  //   return this.examQuestionService.updateExam(examId, dto);
  // }

  @Delete('/question/:id')
  async deleteQuestion(@Param('id') questionId: string) {
    return this.examQuestionService.deleteQuestion(questionId);
  }

  // Xóa bài kiểm tra theo ID
  @Delete('/exam/:id')
  async deleteExam(@Param('id') examId: string) {
    return this.examQuestionService.deleteExam(examId);
  }

  // ✅ Lấy câu hỏi theo ID
  @Get('/question/:id')
  async getQuestionById(@Param('id') questionId: string) {
    return this.examQuestionService.getQuestionById(questionId);
  }

  // Update theo từng question ID
  @Put('/question/:id')
  async updateQuestion(
    @Param('id') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.examQuestionService.updateQuestion(questionId, dto);
  }
}
