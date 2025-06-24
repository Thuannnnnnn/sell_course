import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotify } from './entities/User_Notify.entity';
import { UserNotifyController } from './user_notify.controller';
import { UserNotifyService } from './user_notify.service';
import { User } from '../user/entities/user.entity';
import { Notify } from '../notify/entities/notify.entity';
import { UserModule } from '../user/user.module';
import { NotifyModule } from '../notify/notify.module';
import { NotifyGateway } from '../notify/notify.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotify, User, Notify]),
    UserModule,
    NotifyModule,
  ],
  controllers: [UserNotifyController],
  providers: [UserNotifyService, NotifyGateway],
})
export class UserNotifyModule {}
