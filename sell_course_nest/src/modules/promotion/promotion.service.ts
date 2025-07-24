import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { PromotionNotificationService } from '../notification/promotion-notification.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private promotionNotificationService: PromotionNotificationService,
  ) {}

  private isPromotionExpired(promotion: Promotion): boolean {
    const now = new Date();

    // Check if promotion has end date and it's passed
    if (promotion.endDate && now > promotion.endDate) {
      return true;
    }

    return false;
  }

  private getPromotionStatus(
    promotion: Promotion,
  ): 'active' | 'expired' | 'pending' {
    const now = new Date();

    // Check if promotion has end date and it's passed
    if (promotion.endDate && now > promotion.endDate) {
      return 'expired';
    }

    // Check if promotion hasn't started yet
    if (promotion.startDate && now < promotion.startDate) {
      return 'pending';
    }

    return 'active';
  }

  private addStatusToPromotion(promotion: Promotion): any {
    const status = this.getPromotionStatus(promotion);
    const isExpired = status === 'expired';
    const isPending = status === 'pending';
    return {
      ...promotion,
      status,
      isExpired,
      isPending,
    };
  }

  async create(createPromotionDto: CreatePromotionDto, createdByUserId?: string): Promise<Promotion> {
    const course = await this.courseRepository.findOne({
      where: { courseId: createPromotionDto.courseId },
      relations: ['instructor'],
    });
    console.log(course);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const promotion = this.promotionRepository.create({
      ...createPromotionDto,
      course,
      startDate: createPromotionDto.startDate 
        ? new Date(createPromotionDto.startDate) 
        : null,
      endDate: createPromotionDto.endDate 
        ? new Date(createPromotionDto.endDate) 
        : null,
    });

    const savedPromotion = await this.promotionRepository.save(promotion);

    // Load promotion with course relation
    const promotionWithCourse = await this.promotionRepository.findOne({
      where: { id: savedPromotion.id },
      relations: ['course'],
    });

    // Send notification if createdByUserId is provided
    if (createdByUserId && promotionWithCourse) {
      try {
        const createdByUser = await this.userRepository.findOne({
          where: { user_id: createdByUserId },
        });

        if (createdByUser) {
          console.log(`🎯 Sending promotion notification for: ${promotionWithCourse.name}`);
          await this.promotionNotificationService.notifyOnPromotionCreated(
            promotionWithCourse,
            createdByUser
          );
        }
      } catch (error) {
        console.error('Failed to send promotion notification:', error);
        // Don't throw error to avoid breaking the promotion creation
      }
    }

    return promotionWithCourse;
  }

  async findAll(): Promise<any[]> {
    const promotions = await this.promotionRepository.find({
      relations: ['course'],
    });
    return promotions.map((promotion) => this.addStatusToPromotion(promotion));
  }

  async findOne(code: string): Promise<any> {
    const promotion = await this.promotionRepository.findOne({
      where: { code },
      relations: ['course'],
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return this.addStatusToPromotion(promotion);
  }

  async validatePromotionCode(code: string, courseId?: string): Promise<any> {
    const promotion = await this.promotionRepository.findOne({
      where: { code },
      relations: ['course'],
    });

    if (!promotion) {
      throw new NotFoundException('Invalid promotion code');
    }

    const status = this.getPromotionStatus(promotion);
    
    // Check if promotion is expired or pending
    if (status === 'expired') {
      throw new NotFoundException('Promotion code has expired');
    }
    
    if (status === 'pending') {
      throw new NotFoundException('Promotion code is not active yet');
    }

    // Check if promotion is for specific course
    if (
      courseId &&
      promotion.course &&
      promotion.course.courseId !== courseId
    ) {
      throw new NotFoundException(
        'Promotion code is not valid for this course',
      );
    }

    return {
      ...promotion,
      status,
      isExpired: false, // Since we already checked it's not expired
      isPending: false, // Since we already checked it's not pending
      discount: promotion.discount,
    };
  }

  async update(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
    updatedByUserId?: string,
  ): Promise<any> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Track updated fields for notification
    const updatedFields: string[] = [];

    // If courseId is being updated, find the new course
    if (updatePromotionDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { courseId: updatePromotionDto.courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      promotion.course = course;
      updatedFields.push('course');
    }

    // Update other fields and track changes
    if (updatePromotionDto.name && updatePromotionDto.name !== promotion.name) {
      promotion.name = updatePromotionDto.name;
      updatedFields.push('name');
    }
    if (updatePromotionDto.discount && updatePromotionDto.discount !== promotion.discount) {
      promotion.discount = updatePromotionDto.discount;
      updatedFields.push('discount');
    }
    if (updatePromotionDto.code && updatePromotionDto.code !== promotion.code) {
      promotion.code = updatePromotionDto.code;
      updatedFields.push('code');
    }
    if ('startDate' in updatePromotionDto) {
      const newStartDate = updatePromotionDto.startDate
        ? new Date(updatePromotionDto.startDate)
        : null;
      if (newStartDate?.getTime() !== promotion.startDate?.getTime()) {
        promotion.startDate = newStartDate;
        updatedFields.push('startDate');
      }
    }
    if ('endDate' in updatePromotionDto) {
      const newEndDate = updatePromotionDto.endDate
        ? new Date(updatePromotionDto.endDate)
        : null;
      if (newEndDate?.getTime() !== promotion.endDate?.getTime()) {
        promotion.endDate = newEndDate;
        updatedFields.push('endDate');
      }
    }

    const savedPromotion = await this.promotionRepository.save(promotion);
    
    // Return with course relation loaded
    const updatedPromotion = await this.promotionRepository.findOne({
      where: { id: savedPromotion.id },
      relations: ['course'],
    });

    // Send notification if there are actual changes and updatedByUserId is provided
    if (updatedFields.length > 0 && updatedByUserId && updatedPromotion) {
      try {
        const updatedByUser = await this.userRepository.findOne({
          where: { user_id: updatedByUserId },
        });

        if (updatedByUser) {
          console.log(`🔄 Sending promotion update notification for: ${updatedPromotion.name}`);
          await this.promotionNotificationService.notifyOnPromotionUpdated(
            updatedPromotion,
            updatedByUser,
            updatedFields
          );
        }
      } catch (error) {
        console.error('Failed to send promotion update notification:', error);
      }
    }

    return this.addStatusToPromotion(updatedPromotion);
  }

  async remove(id: string, deletedByUserId?: string): Promise<void> {
    const promotion = await this.promotionRepository.findOne({ 
      where: { id },
      relations: ['course'],
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Send notification before deletion if deletedByUserId is provided
    if (deletedByUserId) {
      try {
        const deletedByUser = await this.userRepository.findOne({
          where: { user_id: deletedByUserId },
        });

        if (deletedByUser) {
          console.log(`🗑️ Sending promotion deletion notification for: ${promotion.name}`);
          await this.promotionNotificationService.notifyOnPromotionDeleted(
            promotion,
            deletedByUser
          );
        }
      } catch (error) {
        console.error('Failed to send promotion deletion notification:', error);
      }
    }

    await this.promotionRepository.remove(promotion);
  }
}
