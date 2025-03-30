import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnswer } from './entities/userAnswer.entity';
import { QuestionHabit } from '../questionHabit/entities/questionHabit.entity';
import { UserAnswerDto } from './dto/userAnswerDto.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepository: Repository<UserAnswer>,
    @InjectRepository(QuestionHabit)
    private readonly questionHabitRepository: Repository<QuestionHabit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: UserAnswerDto) {
    const user = await this.userRepository.findOneBy({ user_id: dto.userId });
    if (!user) throw new Error(`User with ID ${dto.userId} not found`);

    const userAnswers = await Promise.all(
      dto.answers.map(async (item) => {
        const question = await this.questionHabitRepository.findOneBy({
          id: item.questionId,
        });
        if (!question)
          throw new Error(`Question with ID ${item.questionId} not found`);

        return this.userAnswerRepository.create({
          user: user,
          question: question,
          answer: item.answer,
        });
      }),
    );
    return this.userAnswerRepository.save(userAnswers);
  }

  async findAll() {
    return this.userAnswerRepository.find({ relations: ['question'] });
  }

  async findOne(id: string) {
    return this.userAnswerRepository.findOne({
      where: { user: { user_id: id } },
      relations: ['question'],
    });
  }

  async remove(id: string) {
    await this.userAnswerRepository.delete(id);
    return { message: 'Deleted successfully' };
  }
}
