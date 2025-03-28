import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackRatting } from './entities/feedback_ratting.entity';
import { CreateFeedbackRattingDto } from './dto/create-feedback-ratting.dto';
import { UpdateFeedbackRattingDto } from './dto/update-feedback-ratting.dto';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
@Injectable()
export class FeedbackRattingService {
  constructor(
    @InjectRepository(FeedbackRatting)
    private feedbackRattingRepository: Repository<FeedbackRatting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(
    createFeedbackRattingDto: CreateFeedbackRattingDto,
  ): Promise<FeedbackRatting> {
    const { user_id, courseId, star, feedback } = createFeedbackRattingDto;
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) throw new Error('User not found');
    const course = await this.courseRepository.findOne({ where: { courseId } });
    if (!course) throw new Error('Course not found');
    const feedbackRatting = this.feedbackRattingRepository.create({
      user,
      course,
      star,
      feedback,
      createdAt: new Date(),
    });
    return this.feedbackRattingRepository.save(feedbackRatting);
  }
  async findAll(): Promise<FeedbackRatting[]> {
    return this.feedbackRattingRepository.find({
      relations: ['user', 'course'],
    });
  }
  // Fix for src/feedback-ratting/feedback-ratting.service.ts
  async findOne(courseId: string): Promise<FeedbackRatting | null> {
    const feedback = await this.feedbackRattingRepository.findOne({
      where: { course: { courseId } },
      relations: ['user', 'course'],
    });
    return feedback;
  }
  async update(
    id: string,
    updateFeedbackRattingDto: UpdateFeedbackRattingDto,
  ): Promise<FeedbackRatting> {
    const feedback = await this.feedbackRattingRepository.findOne({
      where: { feedbackRattingId: id },
    });
    if (updateFeedbackRattingDto.star !== undefined) {
      feedback.star = updateFeedbackRattingDto.star;
    }
    if (updateFeedbackRattingDto.feedback !== undefined) {
      feedback.feedback = updateFeedbackRattingDto.feedback;
    }
    return this.feedbackRattingRepository.save(feedback);
  }
  async remove(id: string): Promise<void> {
    const feedback = await this.feedbackRattingRepository.findOne({
      where: { feedbackRattingId: id },
    });
    await this.feedbackRattingRepository.remove(feedback);
  }
}
