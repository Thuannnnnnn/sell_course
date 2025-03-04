import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum } from './entities/forum.entity';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import {
  azureUpload,
  azureEdit,
  azureDelete,
} from 'src/utilities/azure.service';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
  ) {}

  async create(
    createForumDto: CreateForumDto,
    file?: Express.Multer.File,
  ): Promise<Forum> {
    let imageUrl = '';
    console.log(createForumDto);
    if (file) {
      imageUrl = await azureUpload(file);
    }

    const forum = this.forumRepository.create({
      ...createForumDto,
      image: imageUrl,
      user: { user_id: createForumDto.userId } as any,
    });

    return await this.forumRepository.save(forum);
  }

  async findAll(): Promise<Forum[]> {
    return await this.forumRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Forum> {
    return await this.forumRepository.findOne({
      where: { forumId: id },
      relations: ['user'],
    });
  }

  async update(
    id: string,
    updateForumDto: UpdateForumDto,
    file?: Express.Multer.File,
  ): Promise<Forum> {
    const forum = await this.forumRepository.findOne({
      where: { forumId: id },
    });

    if (!forum) {
      throw new Error('Forum not found');
    }
    if (file && forum.image) {
      const blob = extractBlobName(forum.image);
      updateForumDto.image = await azureEdit(blob, file);
    }

    Object.assign(forum, updateForumDto);

    return await this.forumRepository.save(forum);
  }

  async delete(id: string): Promise<void> {
    const forum = await this.forumRepository.findOne({
      where: { forumId: id },
    });
    if (!forum) {
      throw new Error('Forum not found');
    }
    if (forum.image) {
      const blob = extractBlobName(forum.image);
      await azureDelete(blob);
    }
    await this.forumRepository.delete(id);
  }
}
function extractBlobName(url: string): string {
  const parts = url.split('/');
  return parts.slice(4).join('/');
}
