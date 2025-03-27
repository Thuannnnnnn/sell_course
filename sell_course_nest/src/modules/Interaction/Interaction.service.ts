import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './entities/Interaction.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { InteractionResponseDTO } from './dto/InteractionResponseDTO.dto';
import { InteractionRequestDTO } from './dto/InteractionRequestDTO.dto';

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<InteractionResponseDTO[]> {
    const interactions = await this.interactionRepository.find({
      relations: ['User', 'course'],
    });
    return interactions.map((interaction) => ({
      id: interaction.id,
      UserId: interaction.user.user_id,
      courseId: interaction.course.courseId,
      interest_score: interaction.interest_score,
    }));
  }

  async findOne(id: number): Promise<InteractionResponseDTO> {
    const interaction = await this.interactionRepository.findOne({
      where: { id },
      relations: ['User', 'course'],
    });
    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }
    return {
      id: interaction.id,
      UserId: interaction.user.user_id,
      courseId: interaction.course.courseId,
      interest_score: interaction.interest_score,
    };
  }

  async create(data: InteractionRequestDTO): Promise<InteractionResponseDTO> {
    const user = await this.UserRepository.findOne({
      where: { user_id: data.UserId },
    });
    if (!user) {
      throw new HttpException(
        `User with ID ${data.UserId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const course = await this.courseRepository.findOne({
      where: { courseId: data.courseId },
    });
    if (!course) {
      throw new HttpException(
        `Course with ID ${data.courseId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const interaction = this.interactionRepository.create({
      user,
      course,
      interest_score: data.interest_score,
    });
    await this.interactionRepository.save(interaction);
    return {
      id: interaction.id,
      UserId: user.user_id,
      courseId: course.courseId,
      interest_score: interaction.interest_score,
    };
  }

  async update(
    id: number,
    data: Partial<InteractionRequestDTO>,
  ): Promise<InteractionResponseDTO> {
    const interaction = await this.interactionRepository.findOne({
      where: { id },
      relations: ['User', 'course'],
    });
    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }

    Object.assign(interaction, data);
    await this.interactionRepository.save(interaction);
    return {
      id: interaction.id,
      UserId: interaction.user.user_id,
      courseId: interaction.course.courseId,
      interest_score: interaction.interest_score,
    };
  }

  async delete(id: number): Promise<void> {
    const result = await this.interactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }
  }
}
