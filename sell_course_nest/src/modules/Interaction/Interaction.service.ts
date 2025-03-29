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
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<InteractionResponseDTO[]> {
    const interactions = await this.interactionRepository.find({
      relations: ['user', 'course'],
    });
    return interactions.map((interaction) => ({
      id: interaction.id,
      userId: interaction.user.user_id,
      courseId: interaction.course.courseId,
      interaction_type: interaction.interaction_type,
    }));
  }

  async findOne(id: string): Promise<InteractionResponseDTO> {
    const interaction = await this.interactionRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }
    return {
      id: interaction.id,
      userId: interaction.user.user_id,
      courseId: interaction.course.courseId,
      interaction_type: interaction.interaction_type,
    };
  }

  async createOrUpdate(data: Interaction): Promise<InteractionResponseDTO> {
    // Validate user existence
    const user = await this.userRepository.findOne({
      where: { user_id: data.user.user_id },
    });
    if (!user) {
      throw new HttpException(
        `User with ID ${data.user.user_id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate course existence
    const course = await this.courseRepository.findOne({
      where: { courseId: data.course.courseId },
    });
    if (!course) {
      throw new HttpException(
        `Course with ID ${data.course.courseId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Attempt to find an existing interaction based on user and course
    let interaction = await this.interactionRepository.findOne({
      where: {
        user: { user_id: data.user.user_id },
        course: { courseId: data.course.courseId },
      },
      relations: ['user', 'course'],
    });

    // If interaction exists, update it; otherwise, create a new one.
    if (interaction) {
      if (data.interaction_type) {
        interaction.interaction_type = data.interaction_type;
      }
    } else {
      interaction = this.interactionRepository.create({
        user,
        course,
        interaction_type: data.interaction_type,
      });
    }

    await this.interactionRepository.save(interaction);

    return {
      id: interaction.id,
      userId: interaction.user.user_id,
      courseId: interaction.course.courseId,
      interaction_type: interaction.interaction_type,
    };
  }

  async delete(id: string): Promise<void> {
    const result = await this.interactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }
  }
}
