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
    });

    return this.promotionRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionRepository.find({ relations: ['course'] });
  }

  async findOne(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { code },
      relations: ['course'],
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }

  async update(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });
    Object.assign(promotion, updatePromotionDto);
    return this.promotionRepository.save(promotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });
    await this.promotionRepository.remove(promotion);
  }
}
