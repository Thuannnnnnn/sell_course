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
    const existingNotify = await this.notifyRepository.findOne({
      where: { notifyId: id },
      relations: ['userNotifies'],
    });

    if (!existingNotify) {
      throw new Error('Thông báo không được tìm thấy trong cơ sở dữ liệu');
    }

    const updatedNotify = await this.notifyRepository.save({
      notifyId: id,
      ...updateNotifyDto,
    });

    const userNotifies = await this.userNotifyRepository.find({
      where: { notify: { notifyId: id } },
      relations: ['user', 'notify'],
    });

    userNotifies.forEach((userNotify) => {
      this.notifyGateway.sendUpdateToUser(userNotify.user.user_id, userNotify);
    });

    return updatedNotify;
  }

  async removeNotification(id: string): Promise<string> {
    try {
      const notify = await this.notifyRepository.findOne({
        where: { notifyId: id },
      });
      if (!notify) {
        return 'No notification found';
      }
      const userNotifies = await this.userNotifyRepository.find({
        where: { notify: { notifyId: id } },
        relations: ['user', 'notify'],
      });

      const userNotifyData = userNotifies.map((userNotify) => ({
        userId: userNotify.user.user_id,
        userNotifyId: userNotify.id,
      }));

      if (userNotifyData.length > 0) {
        await this.userNotifyRepository.remove(userNotifies);
      }

      const notifyDeleteResult = await this.notifyRepository.delete(id);
      if (notifyDeleteResult.affected === 0) {
        return 'Failed to delete Notify';
      }

      if (userNotifyData.length > 0) {
        userNotifyData.forEach(({ userId, userNotifyId }) => {
          if (!userNotifyId) {
            return;
          }

          this.notifyGateway.sendRemoveToUser(userId, userNotifyId);
        });
      }

      return 'Successful';
    } catch (error) {
      throw new Error(`Failed to remove notification: ${error}`);
    }
  }
}
