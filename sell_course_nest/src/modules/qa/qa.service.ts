import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Qa } from './entities/qa.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CreateQaDto } from './dto/create-qa.dto';
import { ResponseQaDto } from './dto/response-qa.dto';
@Injectable()
export class QaService {
  constructor(
    @InjectRepository(Qa) private readonly qaRepository: Repository<Qa>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async createQa(qaData: CreateQaDto): Promise<Qa> {
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

    let parent: Qa | null = null;
    if (qaData.parentId) {
      parent = await this.qaRepository.findOne({
        where: { qaId: qaData.parentId },
      });
    }

    const qa = this.qaRepository.create({
      user,
      course,
      text: qaData.text,
      parent,
    });

    return this.qaRepository.save(qa);
  }

  async findByCourseId(courseId: string): Promise<ResponseQaDto[]> {
    const qaList = await this.qaRepository.find({
      where: { course: { courseId } },
      relations: ['user', 'parent', 'replies'],
      order: { qaId: 'ASC' },
    });

    return qaList.map((qa) => ({
      qaId: qa.qaId,
      userEmail: qa.user.email,
      username: qa.user.username,
      courseId: courseId,
      text: qa.text,
      parentId: qa.parent ? qa.parent.qaId : null,
      createdAt: qa.createdAt.toISOString(),
      avatarImg: qa.user.avatarImg,
    }));
  }

  async findOne(id: string): Promise<Qa> {
    const qa = await this.qaRepository.findOne({
      where: { qaId: id },
      relations: ['user', 'course', 'parent', 'replies'],
    });

    if (!qa) {
      throw new NotFoundException('QA not found');
    }

    return qa;
  }

  async remove(id: string): Promise<void> {
    const result = await this.qaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('QA not found');
    }
  }
}
