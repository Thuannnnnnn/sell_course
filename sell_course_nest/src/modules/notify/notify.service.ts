import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notify } from './entities/notify.entity';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
import { UserNotify } from '../User_Notify/entities/User_Notify.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotifyGateway } from './notify.gateway';
import { UserRole } from '../Auth/user.enum';
import { NotificationType } from './dto/notify.dto';

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
  async create(createNotifyDto: CreateNotifyDto): Promise<{notify: Notify, warnings?: string[]}> {
    const { title, message, type, courseIds, userIds } = createNotifyDto;
    const notify = this.notifyRepository.create({ title, message, type });

    await this.notifyRepository.save(notify);

    let userNotifies = [];
    const warnings: string[] = [];

    if (type === NotificationType.USER && userIds && userIds.length > 0) {
      const users = await this.userRepository.find({
        where: { user_id: In(userIds) },
      });
      if (users.length === 0) {
        warnings.push('Không tìm thấy người dùng nào');
      } else {
        userNotifies = users.map((user) =>
          this.userNotifyRepository.create({ user, notify }),
        );
      }
    } else if (type === NotificationType.COURSE && courseIds && courseIds.length > 0) {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.enrollments', 'enrollment')
        .innerJoin('enrollment.course', 'course')
        .where('course.courseId IN (:...courseIds)', { courseIds })
        .distinct(true)
        .getMany();
      if (users.length === 0) {
        warnings.push('Không tìm thấy người dùng nào liên quan đến khóa học');
      } else {
        userNotifies = users.map((user) =>
          this.userNotifyRepository.create({ user, notify }),
        );
      }
    } else if (type === NotificationType.GLOBAL) {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        warnings.push('Không tìm thấy người dùng nào');
      } else {
        userNotifies = users.map((user) =>
          this.userNotifyRepository.create({ user, notify }),
        );
      }
    } else if (type === NotificationType.ADMIN) {
      const adminUsers = await this.userRepository.find({
        where: { role: UserRole.ADMIN },
      });
      if (adminUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng ADMIN nào');
      } else {
        userNotifies = adminUsers.map((admin) =>
          this.userNotifyRepository.create({ user: admin, notify }),
        );
      }
    } else if (type === NotificationType.INSTRUCTOR) {
      const instructorUsers = await this.userRepository.find({
        where: { role: UserRole.INSTRUCTOR },
      });
      if (instructorUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng INSTRUCTOR nào');
      } else {
        userNotifies = instructorUsers.map((instructor) =>
          this.userNotifyRepository.create({ user: instructor, notify }),
        );
      }
    } else if (type === NotificationType.COURSEREVIEWER) {
      const reviewerUsers = await this.userRepository.find({
        where: { role: UserRole.COURSEREVIEWER },
      });
      if (reviewerUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng COURSEREVIEWER nào');
      } else {
        userNotifies = reviewerUsers.map((reviewer) =>
          this.userNotifyRepository.create({ user: reviewer, notify }),
        );
      }
    } else if (type === NotificationType.SUPPORT) {
      const supportUsers = await this.userRepository.find({
        where: { role: UserRole.SUPPORT },
      });
      if (supportUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng SUPPORT nào');
      } else {
        userNotifies = supportUsers.map((support) =>
          this.userNotifyRepository.create({ user: support, notify }),
        );
      }
    } else if (type === NotificationType.CONTENTMANAGER) {
      const contentManagerUsers = await this.userRepository.find({
        where: { role: UserRole.CONTENTMANAGER },
      });
      if (contentManagerUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng CONTENTMANAGER nào');
      } else {
        userNotifies = contentManagerUsers.map((contentManager) =>
          this.userNotifyRepository.create({ user: contentManager, notify }),
        );
      }
    } else if (type === NotificationType.MARKETINGMANAGER) {
      const marketingManagerUsers = await this.userRepository.find({
        where: { role: UserRole.MARKETINGMANAGER },
      });
      if (marketingManagerUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng MARKETINGMANAGER nào');
      } else {
        userNotifies = marketingManagerUsers.map((marketingManager) =>
          this.userNotifyRepository.create({ user: marketingManager, notify }),
        );
      }
    } else if (type === NotificationType.ALL_STAFF) {
      // Send to all administrative staff roles
      const staffUsers = await this.userRepository.find({
        where: { 
          role: In([
            UserRole.ADMIN, 
            UserRole.INSTRUCTOR, 
            UserRole.COURSEREVIEWER, 
            UserRole.SUPPORT, 
            UserRole.CONTENTMANAGER, 
            UserRole.MARKETINGMANAGER
          ]) 
        },
      });
      if (staffUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng nhân viên nào');
      } else {
        userNotifies = staffUsers.map((staff) =>
          this.userNotifyRepository.create({ user: staff, notify }),
        );
      }
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

    return { notify, warnings: warnings.length > 0 ? warnings : undefined };
  }

  async update(id: string, updateNotifyDto: UpdateNotifyDto): Promise<{notify: Notify, warnings?: string[]}> {
    const { title, message, type, courseIds, userIds } = updateNotifyDto;

    const existingNotify = await this.notifyRepository.findOne({
      where: { notifyId: id },
      relations: ['userNotifies', 'userNotifies.user'],
    });

    if (!existingNotify) {
      throw new Error('Thông báo không được tìm thấy trong cơ sở dữ liệu');
    }

    // Update notify basic info
    if (title) existingNotify.title = title;
    if (message) existingNotify.message = message;
    if (type) existingNotify.type = type;
    
    const updatedNotify = await this.notifyRepository.save(existingNotify);

    let newUserIds: string[] = [];
    const warnings: string[] = [];

    // Get list of users who should receive the notification
    if (type === NotificationType.USER && userIds && userIds.length > 0) {
      const users = await this.userRepository.find({
        where: { user_id: In(userIds) },
      });
      if (users.length === 0) {
        warnings.push('Không tìm thấy người dùng nào');
        newUserIds = [];
      } else {
        newUserIds = users.map((user) => user.user_id);
      }
    } else if (type === NotificationType.COURSE && courseIds && courseIds.length > 0) {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.enrollments', 'enrollment')
        .innerJoin('enrollment.course', 'course')
        .where('course.courseId IN (:...courseIds)', { courseIds })
        .distinct(true)
        .getMany();
      if (users.length === 0) {
        warnings.push('Không tìm thấy người dùng nào liên quan đến khóa học');
        newUserIds = [];
      } else {
        newUserIds = users.map((user) => user.user_id);
      }
    } else if (type === NotificationType.GLOBAL) {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        warnings.push('Không tìm thấy người dùng nào');
        newUserIds = [];
      } else {
        newUserIds = users.map((user) => user.user_id);
      }
    } else if (type === NotificationType.ADMIN) {
      const adminUsers = await this.userRepository.find({
        where: { role: UserRole.ADMIN },
      });
      if (adminUsers.length === 0) {
        warnings.push('Không tìm thấy người dùng ADMIN nào');
        newUserIds = [];
      } else {
        newUserIds = adminUsers.map((admin) => admin.user_id);
      }
    }

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

    // Return the updated notify with relations
    const notify = await this.notifyRepository.findOne({
      where: { notifyId: id },
      relations: ['course', 'userNotifies'],
    });

    return { notify, warnings: warnings.length > 0 ? warnings : undefined };
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

    // Giả sử có một cách khác để lấy course IDs vì coursePurchasedRepository không có
    // Có thể cần thêm logic để lấy course IDs dựa trên user enrollment
    
    return {
      type: notify.type,
      courseIds: [], // Tạm thời return empty array
    };
  }
}
