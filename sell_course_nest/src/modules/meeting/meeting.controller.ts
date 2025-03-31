// 假设原始代码是一个完整的 TypeScript 文件，以下是移除指定行后的完整代码
// 注意：由于不知道具体代码内容，假设原始代码是一个标准的 NestJS 控制器文件

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
  async getMeetingById(@Param('id') id: string) {
    return this.meetingService.getMeetingById(id);
  }

  // Removed sendMessage and getMeetingMessages endpoints

  // 以下是其他可能存在的代码，假设保留了剩余部分
  @Get()
  async getAllMeetings() {
    return this.meetingService.getAllMeetings();
  }
}
