import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotify } from './entities/user_Notify.entity';
import {
  CreateUserNotifyDto,
  UpdateUserNotifyDto,
} from './dto/user-notify.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { Notify } from 'src/modules/notify/entities/notify.entity';

@Injectable()
export class UserNotifyService {
  constructor(
    @InjectRepository(UserNotify)
    private userNotifyRepository: Repository<UserNotify>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notify)
    private notifyRepository: Repository<Notify>,
  ) {}

  async createUserNotify(
    createUserNotifyDto: CreateUserNotifyDto,
  ): Promise<UserNotify> {
    const { userId, notifyId, isRead, isSent, readAt } = createUserNotifyDto;

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const notify = await this.notifyRepository.findOne({ where: { notifyId } });
    if (!notify) throw new NotFoundException('Notification not found');

    const newUserNotify = this.userNotifyRepository.create({
      user,
      notify,
      is_read: isRead ?? false,
      is_sent: isSent ?? false,
      read_at: readAt ?? null,
    });

    return await this.userNotifyRepository.save(newUserNotify);
  }

  async findAllUserNotifies(): Promise<UserNotify[]> {
    return await this.userNotifyRepository.find({
      relations: ['user', 'notify'],
    });
  }

  async findUserNotifyById(id: string): Promise<UserNotify> {
    const userNotify = await this.userNotifyRepository.findOne({
      where: { id },
      relations: ['user', 'notify'],
    });
    if (!userNotify) throw new NotFoundException('User notification not found');
    return userNotify;
  }

  async updateUserNotify(
    id: string,
    updateUserNotifyDto: UpdateUserNotifyDto,
  ): Promise<UserNotify> {
    const userNotify = await this.findUserNotifyById(id);
    Object.assign(userNotify, updateUserNotifyDto);
    return await this.userNotifyRepository.save(userNotify);
  }

  async deleteUserNotify(id: string): Promise<{ message: string }> {
    const userNotify = await this.findUserNotifyById(id);
    await this.userNotifyRepository.remove(userNotify);
    return { message: 'User notification deleted successfully' };
  }
}
