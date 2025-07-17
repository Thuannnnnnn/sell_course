import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPlan } from '../learning-plan/learning-plan.entity';
import { Course } from '../course/entities/course.entity';
import { ScheduleItem } from './entities/schedule_item.entity';
import { CreateScheduleItemDto } from './schedule_item.dto';

@Injectable()
export class ScheduleItemService {
  constructor(
    @InjectRepository(ScheduleItem)
    private scheduleRepo: Repository<ScheduleItem>,

    @InjectRepository(LearningPlan)
    private planRepo: Repository<LearningPlan>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async create(dto: CreateScheduleItemDto) {
    const plan = await this.planRepo.findOne({
      where: { planId: dto.planId },
    });
    if (!plan) throw new NotFoundException('Learning plan not found');

    const course = await this.courseRepo.findOne({
      where: { courseId: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const item = this.scheduleRepo.create({
      ...dto,
      plan,
      course,
    });

    return this.scheduleRepo.save(item);
  }

  async findAll() {
    return this.scheduleRepo.find({
      relations: ['plan', 'course'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async findById(id: string) {
    const item = await this.scheduleRepo.findOne({
      where: { itemId: id },
      relations: ['plan', 'course'],
    });

    if (!item) throw new NotFoundException('Schedule item not found');
    return item;
  }

  async update(id: string, dto: Partial<CreateScheduleItemDto>) {
    const item = await this.scheduleRepo.findOne({ where: { itemId: id } });
    if (!item) throw new NotFoundException('Schedule item not found');

    await this.scheduleRepo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: string) {
    const result = await this.scheduleRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Schedule item not found');
    }
    return { message: 'Deleted successfully' };
  }

  async deleteByPlan(planId: string) {
    const plan = await this.planRepo.findOne({ where: { planId } });
    if (!plan) throw new NotFoundException('Learning plan not found');

    const result = await this.scheduleRepo.delete({ plan: { planId } });
    return { message: `${result.affected} items deleted.` };
  }
}
