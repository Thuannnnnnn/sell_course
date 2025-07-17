import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum } from './entities/forum.entity';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ForumResponseDto } from './dto/forum-response.dto';
import {
  azureUpload,
  azureEdit,
  azureDelete,
} from 'src/utilities/azure.service';
import { ReactionTopic } from './entities/reaction_topic.entity';
import { Discussion } from './entities/discussion.entity';
import { ForumGateway } from './forum.gateway';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(ReactionTopic)
    private readonly reactionTopicRepository: Repository<ReactionTopic>,
    @InjectRepository(Discussion)
    private readonly discussionRepository: Repository<Discussion>,
    private readonly forumGateway: ForumGateway,
  ) {}

  async create(
    createForumDto: CreateForumDto,
    file?: Express.Multer.File,
  ): Promise<Forum> {
    let imageUrl = '';
    if (file) {
      imageUrl = await azureUpload(file);
    }

    const forum = this.forumRepository.create({
      ...createForumDto,
      image: imageUrl,
      user: { user_id: createForumDto.userId } as any,
    });

    const savedForum = await this.forumRepository.save(forum);
    const forums = await this.findAll(); // Lấy danh sách mới
    this.forumGateway.notifyForumUpdate(forums); // Thông báo cập nhật
    return savedForum;
  }

  async findAll(): Promise<ForumResponseDto[]> {
    const forums = await this.forumRepository.find({
      relations: ['user', 'reactionTopics', 'discussions'],
    });

    return forums.map((forum) => ({
      forumId: forum.forumId,
      title: forum.title,
      image: forum.image,
      text: forum.text,
      createdAt: forum.createdAt.toISOString(),
      user: forum.user,
      reactionTopics: forum.reactionTopics.map((reaction) => ({
        reactionId: reaction.reactionId,
        reactionType: reaction.reactionType,
        createdAt: reaction.createdAt.toISOString(),
      })),
      discussions: forum.discussions.map((discussion) => ({
        discussionId: discussion.discussionId,
        content: discussion.content,
        createdAt: discussion.createdAt.toISOString(),
      })),
    }));
  }

  async findOne(id: string): Promise<ForumResponseDto> {
    const forum = await this.forumRepository.findOne({
      where: { forumId: id },
      relations: ['user', 'reactionTopics', 'discussions'],
    });

    if (!forum) {
      throw new Error('Forum not found');
    }

    return {
      forumId: forum.forumId,
      title: forum.title,
      image: forum.image,
      text: forum.text,
      createdAt: forum.createdAt.toISOString(),
      user: forum.user,
      reactionTopics: forum.reactionTopics.map((reaction) => ({
        reactionId: reaction.reactionId,
        reactionType: reaction.reactionType,
        createdAt: reaction.createdAt.toISOString(),
      })),
      discussions: forum.discussions.map((discussion) => ({
        discussionId: discussion.discussionId,
        content: discussion.content,
        createdAt: discussion.createdAt.toISOString(),
      })),
    };
  }

  async update(
    id: string,
    updateForumDto: UpdateForumDto,
    file?: Express.Multer.File,
  ): Promise<Forum> {
    const forum = await this.forumRepository.findOne({
      where: { forumId: id },
    });
    if (!forum) throw new Error('Forum not found');

    if (file && forum.image) {
      const blob = extractBlobName(forum.image);
      updateForumDto.image = await azureEdit(blob, file);
    }

    Object.assign(forum, updateForumDto);
    const updatedForum = await this.forumRepository.save(forum);
    const forums = await this.findAll();
    this.forumGateway.notifyForumUpdate(forums);
    return updatedForum;
  }
  async delete(id: string): Promise<void> {
    const forum = await this.forumRepository.findOne({
      where: { forumId: id },
    });
    if (!forum) throw new Error('Forum not found');

    await this.reactionTopicRepository.delete({ forum: { forumId: id } });
    await this.discussionRepository.delete({ forum: { forumId: id } });
    if (forum.image) {
      const blob = extractBlobName(forum.image);
      await azureDelete(blob);
    }
    await this.forumRepository.delete(id);
    const forums = await this.findAll(); // Lấy danh sách mới
    this.forumGateway.notifyForumUpdate(forums); // Thông báo cập nhật
  }
}
function extractBlobName(url: string): string {
  const parts = url.split('/');
  return parts.slice(4).join('/');
}
