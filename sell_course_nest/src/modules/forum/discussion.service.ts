import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discussion } from './entities/discussion.entity';
import { CreateDiscussionDto } from './dto/discussion.dto';
import { UpdateDiscussionDto } from './dto/discussion.dto';
import { User } from '../user/entities/user.entity';
import { Forum } from '../forum/entities/forum.entity';
import { ForumGateway } from './forum.gateway';
import { ForumService } from './forum.service';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectRepository(Discussion)
    private discussionRepository: Repository<Discussion>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
    private readonly forumGateway: ForumGateway,
    private readonly forumService: ForumService,
  ) {}

  async create(createDiscussionDto: CreateDiscussionDto): Promise<Discussion> {
    const { userId, forumId, content } = createDiscussionDto;

    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const forum = await this.forumRepository.findOneBy({ forumId });
    if (!forum) {
      throw new NotFoundException(`Forum with ID ${forumId} not found`);
    }

    const discussion = this.discussionRepository.create({
      user,
      forum,
      content,
    });

    const savedDiscussion = await this.discussionRepository.save(discussion);
    const forums = await this.forumService.findAll();
    this.forumGateway.notifyForumUpdate(forums);

    return savedDiscussion;
  }

  async findByForum(forumId: string): Promise<Discussion[]> {
    const discussions = await this.discussionRepository.find({
      where: { forum: { forumId } },
      relations: ['user', 'forum'],
      order: { createdAt: 'ASC' },
    });

    if (!discussions.length) {
      throw new NotFoundException(`No discussions found for forum ${forumId}`);
    }

    return discussions;
  }

  async findOne(discussionId: string): Promise<Discussion> {
    const discussion = await this.discussionRepository.findOne({
      where: { discussionId },
      relations: ['user', 'forum'],
    });

    if (!discussion) {
      throw new NotFoundException(
        `Discussion with ID ${discussionId} not found`,
      );
    }

    return discussion;
  }
  async update(
    discussionId: string,
    updateDiscussionDto: UpdateDiscussionDto,
  ): Promise<Discussion> {
    const discussion = await this.findOne(discussionId);

    if (updateDiscussionDto.content) {
      discussion.content = updateDiscussionDto.content;
    }

    return this.discussionRepository.save(discussion);
  }

  async delete(discussionId: string): Promise<void> {
    const discussion = await this.findOne(discussionId);
    await this.discussionRepository.remove(discussion);
    const forums = await this.forumService.findAll();
    this.forumGateway.notifyForumUpdate(forums);
  }
}
