import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { MeetingGateway } from './meeting.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, MeetingParticipant]), // Xóa MeetingMessage
  ],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingGateway],
  exports: [MeetingService],
})
export class MeetingModule {}
