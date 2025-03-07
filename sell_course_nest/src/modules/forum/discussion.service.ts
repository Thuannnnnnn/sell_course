import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discussion } from './entities/discussion.entity';
import { CreateDiscussionDto } from './dto/discussion.dto';
import { UpdateDiscussionDto } from './dto/discussion.dto';
import { User } from '../user/entities/user.entity';
import { Forum } from '../forum/entities/forum.entity';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectRepository(Discussion)
    private discussionRepository: Repository<Discussion>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
  ) {}

  // Create
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

    return this.discussionRepository.save(discussion);
  }

  // Read: Get all discussions by forum
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

  // Read: Get one discussion by ID
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

  // Update
  async update(
    discussionId: string,
    updateDiscussionDto: UpdateDiscussionDto,
  ): Promise<Discussion> {
    const discussion = await this.findOne(discussionId); // Reuse findOne to check existence

    if (updateDiscussionDto.content) {
      discussion.content = updateDiscussionDto.content;
    }

    return this.discussionRepository.save(discussion);
  }

  // Delete
  async delete(discussionId: string): Promise<void> {
    const discussion = await this.findOne(discussionId); // Reuse findOne to check existence
    await this.discussionRepository.remove(discussion);
  }
}
