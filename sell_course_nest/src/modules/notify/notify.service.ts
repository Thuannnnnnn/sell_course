import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notify } from './entities/notify.entity';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
import { UserNotify } from '../User_Notify/entities/user_Notify.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { WebSocketGateway } from '@nestjs/websockets';
import { NotifyGateway } from './notify.gateway';
import { NotificationType, ROLE_BASED_NOTIFICATION_TYPES } from './constants/notification.constants';

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
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    private readonly notifyGateway: NotifyGateway,
  ) {}

  // Helper method to get users by role
  private async getUsersByRole(role: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { role: role },
    });
    
    if (users.length === 0) {
      throw new Error(`Không tìm thấy người dùng nào có role ${role}`);
    }
    
    return users;
  }

  // Helper method to get user IDs by notification type
  private async getUserIdsByType(type: string, userIds?: string[], courseIds?: string[]): Promise<string[]> {
    let targetUserIds: string[] = [];

    if (type === NotificationType.USER && userIds && userIds.length > 0) {
      const users = await this.userRepository.find({
        where: { user_id: In(userIds) },
      });
      if (users.length === 0) throw new Error('Không tìm thấy người dùng nào');
      targetUserIds = users.map((user) => user.user_id);
    } else if (type === NotificationType.COURSE && courseIds && courseIds.length > 0) {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.enrollments', 'enrollment')
        .innerJoin('enrollment.course', 'course')
        .where('course.courseId IN (:...courseIds)', { courseIds })
        .distinct(true)
        .getMany();
      if (users.length === 0)
        throw new Error('Không tìm thấy người dùng nào liên quan đến khóa học');
      targetUserIds = users.map((user) => user.user_id);
    } else if (type === NotificationType.GLOBAL) {
      const users = await this.userRepository.find();
      if (users.length === 0) throw new Error('Không tìm thấy người dùng nào');
      targetUserIds = users.map((user) => user.user_id);
    } else if (ROLE_BASED_NOTIFICATION_TYPES.includes(type as NotificationType)) {
      const users = await this.getUsersByRole(type);
      targetUserIds = users.map((user) => user.user_id);
    }

    return targetUserIds;
  }

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
    const { title, message, type, courseIds, userIds } = createNotifyDto;
    const notify = this.notifyRepository.create({ title, message, type });

    await this.notifyRepository.save(notify);

    let userNotifies = [];

    // Get target user IDs based on notification type
    const targetUserIds = await this.getUserIdsByType(type, userIds, courseIds);

    if (targetUserIds.length > 0) {
      const users = await this.userRepository.find({
        where: { user_id: In(targetUserIds) },
      });

      userNotifies = users.map((user) =>
        this.userNotifyRepository.create({ user, notify }),
      );

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
    const { title, message, type, courseIds, userIds } = updateNotifyDto;

    const existingNotify = await this.notifyRepository.findOne({
      where: { notifyId: id },
      relations: ['userNotifies', 'userNotifies.user'],
    });

    if (!existingNotify) {
      throw new Error('Thông báo không được tìm thấy trong cơ sở dữ liệu');
    }

    // Update notify basic info
    existingNotify.title = title;
    existingNotify.message = message;
    existingNotify.type = type;
    const updatedNotify = await this.notifyRepository.save(existingNotify);

    // Get list of users who should receive the notification
    const newUserIds = await this.getUserIdsByType(type, userIds, courseIds);

    // Get current user notifications
    const currentUserNotifies = await this.userNotifyRepository.find({
      where: { notify: { notifyId: id } },
      relations: ['user'],
    });

    const currentUserIds = currentUserNotifies.map((un) => un.user.user_id);

    // Find users to remove and add
    const userIdsToRemove = currentUserIds.filter(
      (id) => !newUserIds.includes(id),
    );
    const userIdsToAdd = newUserIds.filter(
      (id) => !currentUserIds.includes(id),
    );

    // Remove notifications for users no longer in the list
    if (userIdsToRemove.length > 0) {
      const notifiesToRemove = currentUserNotifies.filter((un) =>
        userIdsToRemove.includes(un.user.user_id),
      );
      await this.userNotifyRepository.remove(notifiesToRemove);

      // Send remove notification via websocket
      userIdsToRemove.forEach((userId) => {
        const userNotify = notifiesToRemove.find(
          (un) => un.user.user_id === userId,
        );
        if (userNotify) {
          this.notifyGateway.sendRemoveToUser(userId, userNotify.id);
        }
      });
    }

    // Add notifications for new users
    if (userIdsToAdd.length > 0) {
      const newUsers = await this.userRepository.find({
        where: { user_id: In(userIdsToAdd) },
      });

      const newUserNotifies = newUsers.map((user) =>
        this.userNotifyRepository.create({ user, notify: updatedNotify }),
      );

      const savedUserNotifies =
        await this.userNotifyRepository.save(newUserNotifies);

      // Send new notifications via websocket
      savedUserNotifies.forEach((userNotify) => {
        this.notifyGateway.sendNotificationToUser(
          userNotify.user.user_id,
          userNotify,
        );
      });
    }

    // Update existing notifications
    const userNotifiesToUpdate = currentUserNotifies.filter((un) =>
      newUserIds.includes(un.user.user_id),
    );

    userNotifiesToUpdate.forEach((userNotify) => {
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

  async getNotifyUserIds(id: string): Promise<string[]> {
    const notify = await this.notifyRepository.findOne({
      where: { notifyId: id },
      relations: ['userNotifies', 'userNotifies.user'],
    });

    if (!notify) {
      throw new Error('Thông báo không được tìm thấy');
    }

    return notify.userNotifies.map((un) => un.user.user_id);
  }

  async getNotifyCourseIds(id: string): Promise<{
    type: string;
    courseIds: string[];
  }> {
    const notify = await this.notifyRepository.findOne({
      where: { notifyId: id },
      relations: ['userNotifies', 'userNotifies.user'],
    });

    if (!notify) {
      throw new Error('Thông báo không được tìm thấy');
    }

    if (notify.type !== 'COURSE') {
      return {
        type: notify.type,
        courseIds: [],
      };
    }

    // Lấy tất cả course IDs từ users đã được notify
    const userIds = notify.userNotifies.map((un) => un.user.user_id);

    const enrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.course', 'course')
      .innerJoin('enrollment.user', 'user')
      .where('user.user_id IN (:...userIds)', { userIds })
      .distinct(true)
      .leftJoinAndSelect('enrollment.course', 'courseData')
      .getMany();

    return {
      type: notify.type,
      courseIds: enrollments.map((enrollment) => enrollment.course.courseId),
    };
  }
}
