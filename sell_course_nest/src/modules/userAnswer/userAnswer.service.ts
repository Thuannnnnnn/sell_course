import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnswer } from './entities/userAnswer.entity';
import { QuestionHabit } from '../questionHabit/entities/questionHabit.entity';
import { UserAnswerDto } from './dto/userAnswerDto.dto';

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepository: Repository<UserAnswer>,
    @InjectRepository(QuestionHabit)
    private readonly questionHabitRepository: Repository<QuestionHabit>,
  ) {}

  async create(dto: UserAnswerDto) {
    const question = await this.questionHabitRepository.findOneBy({
      id: dto.questionId,
    });
    if (!question) throw new Error('Question not found');
    const userAnswer = this.userAnswerRepository.create({ ...dto, question });
    return this.userAnswerRepository.save(userAnswer);
  }

  async findAll() {
    return this.userAnswerRepository.find({ relations: ['question'] });
  }

  async findOne(id: string) {
    return this.userAnswerRepository.findOne({
      where: { id },
      relations: ['question'],
    });
  }

  async update(id: string, dto: UserAnswerDto) {
    await this.userAnswerRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.userAnswerRepository.delete(id);
    return { message: 'Deleted successfully' };
  }
}
