import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  private isPromotionExpired(promotion: Promotion): boolean {
    const now = new Date();

    // Check if promotion has end date and it's passed
    if (promotion.endDate && now > promotion.endDate) {
      return true;
    }

    return false;
  }

  private getPromotionStatus(promotion: Promotion): 'active' | 'expired' | 'pending' {
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

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const course = await this.courseRepository.findOne({
      where: { courseId: createPromotionDto.courseId },
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

    // Return with course relation loaded
    return this.promotionRepository.findOne({
      where: { id: savedPromotion.id },
      relations: ['course']
    });
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
    if (courseId && promotion.course && promotion.course.courseId !== courseId) {
      throw new NotFoundException('Promotion code is not valid for this course');
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
  ): Promise<any> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // If courseId is being updated, find the new course
    if (updatePromotionDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { courseId: updatePromotionDto.courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      promotion.course = course;
    }

    // Update other fields
    if (updatePromotionDto.name) promotion.name = updatePromotionDto.name;
    if (updatePromotionDto.discount) promotion.discount = updatePromotionDto.discount;
    if (updatePromotionDto.code) promotion.code = updatePromotionDto.code;
    if (updatePromotionDto.startDate) promotion.startDate = new Date(updatePromotionDto.startDate);
    if (updatePromotionDto.endDate) promotion.endDate = new Date(updatePromotionDto.endDate);
    const savedPromotion = await this.promotionRepository.save(promotion);
    // Return with course relation loaded
    const updatedPromotion = await this.promotionRepository.findOne({
      where: { id: savedPromotion.id },
      relations: ['course'],
    });

    return this.addStatusToPromotion(updatedPromotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });
    await this.promotionRepository.remove(promotion);
  }
}
