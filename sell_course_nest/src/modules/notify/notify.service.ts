import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notify } from './entities/notify.entity';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
import { UserNotify } from '../User_Notify/entities/user_Notify.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CoursePurchase } from '../course_purchase/entities/course_purchase.entity';

@Injectable()
export class NotifyService {
  constructor(
    @InjectRepository(Notify)
    private notifyRepository: Repository<Notify>,
    @InjectRepository(UserNotify)
    private userNotifyRepository: Repository<UserNotify>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CoursePurchase)
    private coursePurchasedRepository: Repository<CoursePurchase>,
  ) {}

  async create(createNotifyDto: CreateNotifyDto): Promise<Notify> {
    const { title, message, type, courseId, userId } = createNotifyDto;
    const notify = this.notifyRepository.create({ title, message, type });

    if (type === 'COURSE' && courseId) {
      const course = await this.courseRepository.findOne({
        where: { courseId },
      });
      if (!course) throw new Error('Course not found');
      notify.course = course;
    }

    await this.notifyRepository.save(notify);

    if (type === 'USER' && userId) {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });
      if (!user) throw new Error('User not found');
      const userNotify = this.userNotifyRepository.create({ user, notify });
      await this.userNotifyRepository.save(userNotify);
    } else if (type === 'COURSE' && courseId) {
      const users = await this.coursePurchasedRepository.find({
        where: { course: { courseId } },
        relations: ['user'],
      });
      const userNotifies = users.map((coursePurchase) =>
        this.userNotifyRepository.create({ user: coursePurchase.user, notify }),
      );
      await this.userNotifyRepository.save(userNotifies);
    }

    return notify;
  }

  async findAll(): Promise<Notify[]> {
    return this.notifyRepository.find({
      relations: ['userNotifies', 'course'],
    });
  }

  async findByUser(userId: string): Promise<UserNotify[]> {
    return this.userNotifyRepository.find({
      where: { user: { user_id: userId } },
      relations: ['notify'],
    });
  }

  async findByCourse(courseId: string): Promise<Notify[]> {
    return this.notifyRepository.find({ where: { course: { courseId } } });
  }

  async update(id: string, updateNotifyDto: UpdateNotifyDto): Promise<Notify> {
    await this.notifyRepository.update(id, updateNotifyDto);
    return this.notifyRepository.findOne({ where: { notifyId: id } });
  }

  async remove(id: string): Promise<void> {
    await this.notifyRepository.delete(id);
  }
}
