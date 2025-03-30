import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { MeetingMessage } from './entities/meeting-message.entity';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { MeetingGateway } from './meeting.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, MeetingParticipant, MeetingMessage]),
  ],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingGateway],
  exports: [MeetingService],
})
export class MeetingModule {}
