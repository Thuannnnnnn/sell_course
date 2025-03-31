import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  async createMeeting(@Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingService.createMeeting(createMeetingDto);
  }

  @Get(':id')
  async getMeeting(@Param('id') id: string) {
    return this.meetingService.getMeeting(id);
  }

}
