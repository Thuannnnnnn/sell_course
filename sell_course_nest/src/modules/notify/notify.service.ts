import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notify } from './entities/notify.entity';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
import { UserNotify } from '../User_Notify/entities/user_Notify.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CoursePurchase } from '../course_purchase/entities/course_purchase.entity';
import { WebSocketGateway } from '@nestjs/websockets';
import { NotifyGateway } from './notify.gateway';

@WebSocketGateway({ cors: true })
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
    private readonly notifyGateway: NotifyGateway,
  ) {}

  async getAll(): Promise<Notify[]> {
    return await this.notifyRepository.find({
      relations: ['course', 'userNotifies'],
    });
  }

  async getById(id: string): Promise<Notify> {
    const notify = await this.notifyRepository.findOne({
      where: { notifyId: id },
      relations: ['course', 'userNotifies'],
    });

    if (!notify) {
      throw new Error(`Notify with ID ${id} not found`);
    }

    return notify;
  }
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

    let userNotifies = [];
    if (type === 'USER' && userId) {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });
      if (!user) throw new Error('User not found');
      userNotifies.push(this.userNotifyRepository.create({ user, notify }));
    } else if (type === 'COURSE' && courseId) {
      const users = await this.coursePurchasedRepository.find({
        where: { course: { courseId } },
        relations: ['user'],
      });
      userNotifies = users.map((coursePurchase) =>
        this.userNotifyRepository.create({ user: coursePurchase.user, notify }),
      );
    } else if (type === 'GLOBAL') {
      const users = await this.userRepository.find();
      userNotifies = users.map((user) =>
        this.userNotifyRepository.create({ user, notify }),
      );
    }

    if (userNotifies.length > 0) {
      await this.userNotifyRepository.save(userNotifies);
      userNotifies.forEach((userNotify) =>
        this.notifyGateway.sendNotificationToUser(
          userNotify.user.user_id,
          userNotify,
        ),
      );
    }

    return notify;
  }

  async update(id: string, updateNotifyDto: UpdateNotifyDto): Promise<Notify> {
    const { title, message } = updateNotifyDto;

    await this.notifyRepository.update(id, { title, message });

    const updatedNotify = await this.notifyRepository.findOne({
      where: { notifyId: id },
    });

    if (!updatedNotify) throw new Error('Notification not found');

    const userNotifies = await this.userNotifyRepository.find({
      where: { notify: { notifyId: id } },
      relations: ['user'],
    });

    userNotifies.forEach((userNotify) =>
      this.notifyGateway.sendUpdateToUser(
        userNotify.user.user_id,
        updatedNotify,
      ),
    );

    return updatedNotify;
  }

  async removeNotification(id: string): Promise<string> {
    const userNotifies = await this.userNotifyRepository.find({
      where: { notify: { notifyId: id } },
      relations: ['user'],
    });

    if (userNotifies.length > 0) {
      await this.userNotifyRepository.remove(userNotifies);
    }

    await this.userNotifyRepository.delete({ notify: { notifyId: id } });
    userNotifies.forEach((userNotify) =>
      this.notifyGateway.sendRemoveToUser(userNotify.user.user_id, id),
    );
    await this.notifyRepository.delete(id);
    return 'Sucessful';
  }
}
