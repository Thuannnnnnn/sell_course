import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyAnswerOption } from './survey-answer-option.entity';
import { SurveyQuestion } from '../survey-response/survey-response.entity';
import { CreateSurveyAnswerOptionDto } from './create-survey-answer-option.dto';

@Injectable()
export class SurveyAnswerOptionService {
  constructor(
    @InjectRepository(SurveyAnswerOption)
    private optionRepo: Repository<SurveyAnswerOption>,

    @InjectRepository(SurveyQuestion)
    private questionRepo: Repository<SurveyQuestion>,
  ) {}

  async create(dto: CreateSurveyAnswerOptionDto): Promise<SurveyAnswerOption> {
    const question = await this.questionRepo.findOne({
      where: { id: dto.questionId },
    });
    if (!question) throw new NotFoundException('Survey question not found');

    const option = this.optionRepo.create({ text: dto.text, question });
    return this.optionRepo.save(option);
  }

  async findAll(): Promise<SurveyAnswerOption[]> {
    return this.optionRepo.find({ relations: ['question'] });
  }

  async findByQuestionId(questionId: string): Promise<SurveyAnswerOption[]> {
    return this.optionRepo.find({
      where: { question: { id: questionId } },
      relations: ['question'],
    });
  }
}
