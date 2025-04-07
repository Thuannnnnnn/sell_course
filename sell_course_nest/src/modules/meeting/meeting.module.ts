import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { MeetingsService } from './meeting.service';
import { MeetingsController } from './meeting.controller';
import { MeetingsGateway } from './meeting.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, MeetingParticipant])],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsGateway],
  exports: [MeetingsService],
})
export class MeetingModule {}
