import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QaStudy } from './entities/qa.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CreateQaDto } from './dto/create-qa.dto';
import { ResponseQaDto } from './dto/response-qa.dto';
import { ReactionQa } from './entities/reaction_qa.entity';
import { QaGateway } from './qa_study.gateway';

@Injectable()
export class QaStudyService {
  constructor(
    @InjectRepository(QaStudy)
    private readonly qaRepository: Repository<QaStudy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(ReactionQa)
    private readonly reactionQaRepository: Repository<ReactionQa>,
    private readonly qaGateway: QaGateway,
  ) {}

  async createQa(qaData: CreateQaDto): Promise<QaStudy> {
    const user = await this.userRepository.findOne({
      where: { email: qaData.userEmail },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { courseId: qaData.courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    let parent: QaStudy | null = null;
    if (qaData.parentId) {
      parent = await this.qaRepository.findOne({
        where: { qaStudyId: qaData.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent QA not found');
      }
    }

    const qa = this.qaRepository.create({
      user,
      course,
      text: qaData.text,
      parent,
    });
    const savedQa = await this.qaRepository.save(qa);
    const qaResponse: ResponseQaDto = {
      qaId: savedQa.qaStudyId,
      userEmail: user.email,
      username: user.username,
      courseId: course.courseId,
      text: savedQa.text,
      parentId: parent?.qaStudyId || null,
      createdAt: savedQa.createdAt.toISOString(),
      avatarImg: user.avatarImg,
    };
    await this.qaGateway.broadcastNewQa(qaResponse);
    return savedQa;
  }
  async findByCourseId(courseId: string): Promise<ResponseQaDto[]> {
    const qaList = await this.qaRepository.find({
      where: { course: { courseId } },
      relations: [
        'user',
        'parent',
        'replies',
        'reactionQas',
        'reactionQas.user',
      ],
      order: { qaStudyId: 'ASC' },
    });

    return qaList.map((qa) => ({
      qaId: qa.qaStudyId,
      userEmail: qa.user.email,
      username: qa.user.username,
      courseId: courseId,
      text: qa.text,
      parentId: qa.parent ? qa.parent.qaStudyId : null,
      createdAt: qa.createdAt.toISOString(),
      avatarImg: qa.user.avatarImg,
      reactionQas: qa.reactionQas.map((reaction) => ({
        userEmail: reaction.user.email,
        reactionType: reaction.reactionType,
      })),
    }));
  }

  async findOne(id: string): Promise<QaStudy> {
    const qa = await this.qaRepository.findOne({
      where: { qaStudyId: id },
      relations: ['user', 'course', 'parent', 'replies'],
    });

    if (!qa) {
      throw new NotFoundException('QA not found');
    }

    return qa;
  }

  async remove(id: string): Promise<void> {
    const qa = await this.findOne(id);
    await this.reactionQaRepository.delete({ qa: { qaStudyId: id } });

    const result = await this.qaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('QA not found');
    }
    await this.qaGateway.broadcastRemoveQa(id, qa.course.courseId);
  }

  async updateQa(qaId: string, text: string): Promise<ResponseQaDto> {
    const qa = await this.findOne(qaId);
    qa.text = text;
    const updatedQa = await this.qaRepository.save(qa);
  
    const qaResponse: ResponseQaDto = {
      qaId: updatedQa.qaStudyId,
      userEmail: updatedQa.user.email,
      username: updatedQa.user.username,
      courseId: updatedQa.course.courseId,
      text: updatedQa.text,
      parentId: updatedQa.parent?.qaStudyId || null,
      createdAt: updatedQa.createdAt.toISOString(),
      avatarImg: updatedQa.user.avatarImg,
      reactionQas: updatedQa.reactionQas?.map((reaction) => ({
        userEmail: reaction.user.email,
        reactionType: reaction.reactionType,
      })),
    };
  
    await this.qaGateway.broadcastUpdateQa(qaResponse);
    return qaResponse;
  }
}
