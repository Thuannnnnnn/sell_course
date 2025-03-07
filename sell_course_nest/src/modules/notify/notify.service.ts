import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notify } from './entities/notify.entity';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';

@Injectable()
export class NotifyService {
  constructor(
    @InjectRepository(Notify)
    private notifyRepository: Repository<Notify>,
  ) {}

  async createNotify(createNotifyDto: CreateNotifyDto): Promise<Notify> {
    const newNotify = this.notifyRepository.create(createNotifyDto);
    return await this.notifyRepository.save(newNotify);
  }

  async findAllNotify(): Promise<Notify[]> {
    return await this.notifyRepository.find();
  }

  async findNotifyById(notifyId: string): Promise<Notify> {
    const notify = await this.notifyRepository.findOne({
      where: { notifyId },
    });
    if (!notify) {
      throw new NotFoundException('Notification not found');
    }
    return notify;
  }

  async updateNotify(
    notifyId: string,
    updateNotifyDto: UpdateNotifyDto,
  ): Promise<Notify> {
    const notify = await this.findNotifyById(notifyId);
    Object.assign(notify, updateNotifyDto);
    return await this.notifyRepository.save(notify);
  }

  async deleteNotify(notifyId: string): Promise<{ message: string }> {
    const notify = await this.findNotifyById(notifyId);
    await this.notifyRepository.remove(notify);
    return { message: 'Notification deleted successfully' };
  }
}
