import { Module } from '@nestjs/common';
import { Notify } from './entities/notify.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { UserNotify } from '../User_Notify/entities/user_Notify.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notify, UserNotify])],
  controllers: [NotifyController],
  providers: [NotifyService],
})
export class NotifyModule {}
