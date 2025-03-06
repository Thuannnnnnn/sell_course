import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactionTopic } from './entities/reaction_topic.entity';
import { CreateReactionTopicDto } from './dto/reaction-topic.dto';
import { User } from '../user/entities/user.entity';
import { Forum } from '../forum/entities/forum.entity';

@Injectable()
export class ReactionTopicService {
  constructor(
    @InjectRepository(ReactionTopic)
    private reactionTopicRepository: Repository<ReactionTopic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
  ) {}

  async createReaction(
    createReactionDto: CreateReactionTopicDto,
  ): Promise<ReactionTopic> {
    const { userId, forumId, reactionType } = createReactionDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const forum = await this.forumRepository.findOne({
      where: { forumId },
    });
    if (!forum) {
      throw new NotFoundException(`Forum with ID ${forumId} not found`);
    }
    const existingReaction = await this.reactionTopicRepository.findOne({
      where: { user: { user_id: userId }, forum: { forumId } },
    });
    if (existingReaction) {
      throw new ConflictException(
        `User ${userId} already reacted to forum ${forumId}`,
      );
    }
    const reaction = this.reactionTopicRepository.create({
      user,
      forum,
      reactionType,
    });

    return this.reactionTopicRepository.save(reaction);
  }
  async findReactionsByForum(forumId: string): Promise<ReactionTopic[]> {
    const reactions = await this.reactionTopicRepository.find({
      where: { forum: { forumId } },
      relations: ['user', 'forum'],
    });
    if (!reactions.length) {
      throw new NotFoundException(`No reactions found for forum ${forumId}`);
    }
    return reactions;
  }
}
