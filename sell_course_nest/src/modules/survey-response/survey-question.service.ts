import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyQuestion } from './survey-response.entity';
import { SurveyAnswerOption } from '../surveyAnswerOption/survey-answer-option.entity';
import {
  CreateSurveyQuestionDto,
  UpdateSurveyQuestionWithOptionsDto,
} from './create-survey-question-with-options.dto';

@Injectable()
export class SurveyQuestionService {
  constructor(
    @InjectRepository(SurveyQuestion)
    private questionRepo: Repository<SurveyQuestion>,

    @InjectRepository(SurveyAnswerOption)
    private optionRepo: Repository<SurveyAnswerOption>,
  ) {}

  async createMany(dtos: CreateSurveyQuestionDto[]): Promise<SurveyQuestion[]> {
    const results: SurveyQuestion[] = [];

    for (const dto of dtos) {
      const question = this.questionRepo.create({
        type: dto.type,
        questionText: dto.questionText,
        required: dto.required,
      });

      const savedQuestion = await this.questionRepo.save(question);

      const options = (dto.options || []).map((text) =>
        this.optionRepo.create({ text, question: savedQuestion }),
      );
      await this.optionRepo.save(options);

      const fullQuestion = await this.questionRepo.findOne({
        where: { id: savedQuestion.id },
        relations: ['options'],
      });

      results.push(fullQuestion!);
    }

    return results;
  }
  async findAll(): Promise<SurveyQuestion[]> {
    return this.questionRepo.find({ relations: ['options'] });
  }

  async updateQuestionWithOptions(
    id: string,
    dto: UpdateSurveyQuestionWithOptionsDto,
  ): Promise<SurveyQuestion> {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!question) throw new NotFoundException('Survey question not found');

    if (dto.question !== undefined) question.id = dto.question;
    if (dto.type !== undefined) question.type = dto.type;
    if (dto.required !== undefined) question.required = dto.required;

    const updatedQuestion = await this.questionRepo.save(question);

    if (dto.options !== undefined) {
      await this.optionRepo.delete({ question: updatedQuestion });
      const newOptions = dto.options.map((text) =>
        this.optionRepo.create({ text, question: updatedQuestion }),
      );
      await this.optionRepo.save(newOptions);
    }

    return this.questionRepo.findOne({ where: { id }, relations: ['options'] });
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Survey question not found');
    await this.questionRepo.delete(id);
  }
}
