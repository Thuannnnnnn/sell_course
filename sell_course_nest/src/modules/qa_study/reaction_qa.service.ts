import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactionQa } from './entities/reaction_qa.entity';
import { CreateReactionQaDto } from './dto/reaction_qa.dto';
import { User } from '../user/entities/user.entity';
import { QaStudy } from './entities/qa.entity';

@Injectable()
export class ReactionQaService {
  constructor(
    @InjectRepository(ReactionQa)
    private reactionQaRepository: Repository<ReactionQa>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(QaStudy)
    private qaStudyRepository: Repository<QaStudy>,
  ) {}

  async createReaction(
    createReactionDto: CreateReactionQaDto,
  ): Promise<ReactionQa> {
    const { userId, qaStudyId, reactionType } = createReactionDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const qaStudy = await this.qaStudyRepository.findOne({
      where: { qaStudyId },
    });
    if (!qaStudy) {
      throw new NotFoundException(`QA Study with ID ${qaStudyId} not found`);
    }
    const existingReaction = await this.reactionQaRepository.findOne({
      where: { user: { user_id: userId }, qa: { qaStudyId } },
    });

    if (existingReaction) {
      if (existingReaction.reactionType !== reactionType) {
        existingReaction.reactionType = reactionType;
        return this.reactionQaRepository.save(existingReaction);
      }
      return existingReaction;
    }
    const reaction = this.reactionQaRepository.create({
      user,
      qa: qaStudy,
      reactionType,
    });
    return this.reactionQaRepository.save(reaction);
  }
  async findReactionsByQa(qaStudyId: string): Promise<ReactionQa[]> {
    const reactions = await this.reactionQaRepository.find({
      where: { qa: { qaStudyId } },
      relations: ['user', 'qa'],
    });
    if (!reactions.length) {
      throw new NotFoundException(
        `No reactions found for QA Study ${qaStudyId}`,
      );
    }
    return reactions;
  }
}
