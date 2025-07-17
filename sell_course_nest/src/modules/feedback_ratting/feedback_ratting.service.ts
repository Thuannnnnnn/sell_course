import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackRatting } from './entities/feedback_ratting.entity';
import { CreateFeedbackRattingDto } from './dto/create-feedback-ratting.dto';
import { UpdateFeedbackRattingDto } from './dto/update-feedback-ratting.dto';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import axios from 'axios';

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

  private async generateEmbeddingCreate(feedback: string): Promise<number[]> {
    try {
      if (!feedback || feedback.trim() === '') {
        return [];
      }
      
      const response = await axios.post(
        `${process.env.FASTAPI_URL}/create_course_embedding`,
        {
          feedback: feedback,
        },
      );
      return response.data.embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return [];
    }
  }

  async create(
    createFeedbackRattingDto: CreateFeedbackRattingDto,
  ): Promise<FeedbackRatting> {
    const { user_id, courseId, star, feedback } = createFeedbackRattingDto;
    
    if (!user_id) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    
    if (!courseId) {
      throw new HttpException('Course ID is required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const course = await this.courseRepository.findOne({ where: { courseId } });
    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    // Check if user already has a rating for this course
    const existingRating = await this.feedbackRattingRepository.findOne({
      where: {
        user: { user_id },
        course: { courseId },
      },
    });

    if (existingRating) {
      // Update existing rating
      existingRating.star = star;
      existingRating.feedback = feedback || existingRating.feedback;
      
      if (feedback && feedback !== existingRating.feedback) {
        existingRating.embedding = await this.generateEmbeddingCreate(feedback);
      }
      
      return this.feedbackRattingRepository.save(existingRating);
    }

    // Create new rating
    const embedding = await this.generateEmbeddingCreate(feedback || '');
    
    const feedbackRatting = this.feedbackRattingRepository.create({
      user,
      course,
      star,
      feedback,
      createdAt: new Date(),
      embedding,
    });
    
    return this.feedbackRattingRepository.save(feedbackRatting);
  }

  async findAll(): Promise<FeedbackRatting[]> {
    return this.feedbackRattingRepository.find({
      relations: ['user', 'course'],
    });
  }

  async findOne(courseId: string): Promise<FeedbackRatting[]> {
    if (!courseId) {
      throw new HttpException('Course ID is required', HttpStatus.BAD_REQUEST);
    }
    
    const feedbacks = await this.feedbackRattingRepository.find({
      where: { course: { courseId } },
      relations: ['user', 'course'],
    });
    
    return feedbacks;
  }

  async update(
    id: string,
    updateFeedbackRattingDto: UpdateFeedbackRattingDto,
  ): Promise<FeedbackRatting> {
    if (!id) {
      throw new HttpException('Feedback Rating ID is required', HttpStatus.BAD_REQUEST);
    }
    
    const feedback = await this.feedbackRattingRepository.findOne({
      where: { feedbackRattingId: id },
    });
    
    if (!feedback) {
      throw new HttpException('Feedback Rating not found', HttpStatus.NOT_FOUND);
    }

    if (updateFeedbackRattingDto.star !== undefined) {
      feedback.star = updateFeedbackRattingDto.star;
    }
    
    if (updateFeedbackRattingDto.feedback !== undefined) {
      feedback.feedback = updateFeedbackRattingDto.feedback;
      feedback.embedding = await this.generateEmbeddingCreate(updateFeedbackRattingDto.feedback);
    }
    
    return this.feedbackRattingRepository.save(feedback);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new HttpException('Feedback Rating ID is required', HttpStatus.BAD_REQUEST);
    }
    
    const feedback = await this.feedbackRattingRepository.findOne({
      where: { feedbackRattingId: id },
    });
    
    if (!feedback) {
      throw new HttpException('Feedback Rating not found', HttpStatus.NOT_FOUND);
    }
    
    await this.feedbackRattingRepository.remove(feedback);
  }
}