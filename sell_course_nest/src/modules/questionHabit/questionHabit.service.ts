// src/services/question-habit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionHabit } from './entities/questionHabit.entity';
import { QuestionHabitDto } from './dto/questionHabitDto.dto';

@Injectable()
export class QuestionHabitService {
  constructor(
    @InjectRepository(QuestionHabit)
    private readonly questionHabitRepository: Repository<QuestionHabit>,
  ) {}

  async create(dto: { question: string }) {
    const questionHabit = this.questionHabitRepository.create({
      question: dto.question, // Không truyền "id" vào đây
    });
    return await this.questionHabitRepository.save(questionHabit);
  }

  async findAll() {
    return this.questionHabitRepository.find();
  }

  async findOne(id: string) {
    return this.questionHabitRepository.findOneBy({ id });
  }

  async update(id: string, dto: QuestionHabitDto) {
    await this.questionHabitRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.questionHabitRepository.delete(id);
    return { message: 'Deleted successfully' };
  }
}
