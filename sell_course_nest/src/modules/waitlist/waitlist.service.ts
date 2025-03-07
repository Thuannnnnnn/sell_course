// waitlist.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { CreateWaitlistDto, UpdateWaitlistDto } from './dto/waitlist.dto';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private waitlistRepository: Repository<Waitlist>,
  ) {}

  async create(createWaitlistDto: CreateWaitlistDto): Promise<Waitlist> {
    const user = await this.waitlistRepository.manager.findOne(User, {
      where: { user_id: createWaitlistDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createWaitlistDto.userId} not found`,
      );
    }

    const course = await this.waitlistRepository.manager.findOne(Course, {
      where: { courseId: createWaitlistDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createWaitlistDto.courseId} not found`,
      );
    }

    const waitlist = this.waitlistRepository.create({
      user,
      course,
      isChecked: createWaitlistDto.isChecked ?? false,
    });

    return this.waitlistRepository.save(waitlist);
  }

  async findAll(): Promise<Waitlist[]> {
    return this.waitlistRepository.find({
      relations: ['user', 'course'],
    });
  }

  async findOne(waitlistId: string): Promise<Waitlist> {
    const waitlist = await this.waitlistRepository.findOne({
      where: { waitlistId },
      relations: ['user', 'course'],
    });
    if (!waitlist) {
      throw new NotFoundException(`Waitlist with ID ${waitlistId} not found`);
    }
    return waitlist;
  }
  async findByUserId(userId: string): Promise<Waitlist[]> {
    const waitlists = await this.waitlistRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'course'],
    });

    if (!waitlists.length) {
      throw new NotFoundException(`No waitlist found for user ID ${userId}`);
    }
    return waitlists;
  }

  async update(
    waitlistId: string,
    updateWaitlistDto: UpdateWaitlistDto,
  ): Promise<Waitlist> {
    const waitlist = await this.findOne(waitlistId);
    Object.assign(waitlist, updateWaitlistDto);
    return this.waitlistRepository.save(waitlist);
  }

  async remove(waitlistId: string): Promise<void> {
    const waitlist = await this.findOne(waitlistId);
    await this.waitlistRepository.remove(waitlist);
  }
}
