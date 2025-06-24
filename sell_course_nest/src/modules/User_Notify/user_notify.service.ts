import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotify } from './entities/User_Notify.entity';
import { UpdateUserNotifyDto } from './dto/user-notify.dto';
import { NotifyGateway } from '../notify/notify.gateway';
@Injectable()
export class UserNotifyService {
  constructor(
    @InjectRepository(UserNotify)
    private userNotifyRepository: Repository<UserNotify>,
    private readonly notifyGateway: NotifyGateway,
  ) {}

  async findAllUserNotifies(): Promise<UserNotify[]> {
    return await this.userNotifyRepository.find({
      relations: ['user', 'notify'],
    });
  }

  async findUserNotifyById(userId: string): Promise<UserNotify[]> {
    const userNotifies = await this.userNotifyRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'notify'],
      order: { read_at: 'ASC' },
    });
    if (!userNotifies.length)
      throw new NotFoundException('No notifications found');
    return userNotifies;
  }

  async updateUserNotify(
    id: string,
    updateUserNotifyDto: UpdateUserNotifyDto,
  ): Promise<UserNotify> {
    const userNotify = await this.userNotifyRepository.findOne({
      where: { id },
    });
    if (!userNotify) throw new NotFoundException('Notification not found');

    if (updateUserNotifyDto.isRead === true) {
      userNotify.is_read = true;
      userNotify.read_at = new Date();
    }

    Object.assign(userNotify, updateUserNotifyDto);
    const updatedNotify = await this.userNotifyRepository.save(userNotify);

    this.notifyGateway.sendUpdateToUser(userNotify.user.user_id, updatedNotify);
    return updatedNotify;
  }

  async markAllNotificationsAsSent(user_id: string): Promise<void> {
    const notifications = await this.userNotifyRepository.find({
      where: { user: { user_id } },
      relations: ['user', 'notify'],
    });

    for (const notification of notifications) {
      if (notification.is_sent == false) {
        notification.is_sent = true;
      }
    }
    await this.userNotifyRepository.save(notifications);
    this.notifyGateway.sendMarkAllAsSentToUser(user_id, notifications);
  }
}
