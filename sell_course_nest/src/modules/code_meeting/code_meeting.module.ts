import { Module } from '@nestjs/common';
import { CodeMeetingGateway } from './code_meeting.gateway';
import { CodeMeetingService } from './code_meeting.service';
import { CodeMeetingController } from './code_meeting.controller';

@Module({
  controllers: [CodeMeetingController],
  providers: [CodeMeetingGateway, CodeMeetingService],
  exports: [CodeMeetingService],
})
export class CodeMeetingModule {}
