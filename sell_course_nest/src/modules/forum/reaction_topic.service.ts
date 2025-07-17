import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactionTopic } from './entities/reaction_topic.entity';
import { CreateReactionTopicDto } from './dto/reaction-topic.dto';
import { User } from '../user/entities/user.entity';
import { Forum } from '../forum/entities/forum.entity';
import { ForumGateway } from './forum.gateway';
import { ForumService } from './forum.service';

@Injectable()
export class ReactionTopicService {
  constructor(
    @InjectRepository(ReactionTopic)
    private reactionTopicRepository: Repository<ReactionTopic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
    private readonly forumGateway: ForumGateway,
    private readonly forumService: ForumService,
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

    const forum = await this.forumRepository.findOne({ where: { forumId } });
    if (!forum) {
      throw new NotFoundException(`Forum with ID ${forumId} not found`);
    }

    const existingReaction = await this.reactionTopicRepository.findOne({
      where: { user: { user_id: userId }, forum: { forumId } },
    });

    let reaction;
    if (existingReaction) {
      if (existingReaction.reactionType !== reactionType) {
        existingReaction.reactionType = reactionType;
        reaction = await this.reactionTopicRepository.save(existingReaction);
      } else {
        reaction = existingReaction;
      }
    } else {
      reaction = this.reactionTopicRepository.create({
        user,
        forum,
        reactionType,
      });
      reaction = await this.reactionTopicRepository.save(reaction);
    }

    const updatedReactions = await this.findReactionsByForum(forumId);
    this.forumGateway.notifyReactionsUpdate(
      forumId,
      updatedReactions.map((r) => ({
        reactionId: r.reactionId,
        reactionType: r.reactionType,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    );

    const forums = await this.forumService.findAll();
    this.forumGateway.notifyForumUpdate(forums);

    return reaction;
  }

  async findReactionsByForum(forumId: string): Promise<ReactionTopic[]> {
    const reactions = await this.reactionTopicRepository.find({
      where: { forum: { forumId } },
      relations: ['user', 'forum'],
    });
    return reactions;
  }

  async deleteReaction(userId: string, forumId: string): Promise<void> {
    const reaction = await this.reactionTopicRepository.findOne({
      where: { user: { user_id: userId }, forum: { forumId } },
      relations: ['user', 'forum'],
    });

    if (!reaction) {
      throw new NotFoundException(
        `Reaction by user ${userId} on forum ${forumId} not found`,
      );
    }

    await this.reactionTopicRepository.remove(reaction);

    const updatedReactions = await this.findReactionsByForum(forumId);
    this.forumGateway.notifyReactionsUpdate(
      forumId,
      updatedReactions.map((r) => ({
        reactionId: r.reactionId,
        reactionType: r.reactionType,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    );

    const forums = await this.forumService.findAll();
    this.forumGateway.notifyForumUpdate(forums);
  }
}
