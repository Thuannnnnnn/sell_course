import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MeetingsService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post('create')
  async createRoom(@Body() createMeetingDto: CreateMeetingDto) {
    const meeting =
      await this.meetingsService.createRoomMeeting(createMeetingDto);
    return { meetingId: meeting.id, meetingCode: meeting.meetingCode };
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  async joinRoom(
    @Body() joinMeetingDto: JoinMeetingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Sử dụng userId từ token JWT thay vì từ DTO
    const userId = req.user.userId;
    const meeting = await this.meetingsService.joinRoomMeeting(
      joinMeetingDto.meetingCode,
      userId,
    );
    return { meetingId: meeting.id, meetingCode: meeting.meetingCode };
  }

  @Get('joined')
  async getJoinedMeetings(@Query('userId') userId: string) {
    const meetings = await this.meetingsService.getJoinedMeetings(userId);
    return {
      success: true,
      data: meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        meetingCode: meeting.meetingCode,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        isActive: meeting.isActive,
        isHost: meeting.hostId === userId,
      })),
    };
  }

  @Get('hosted')
  async getHostedMeetings(@Query('userId') userId: string) {
    const meetings = await this.meetingsService.getHostedMeetings(userId);
    return {
      success: true,
      data: meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        meetingCode: meeting.meetingCode,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        isActive: meeting.isActive,
        participantCount: meeting.participants?.length || 0,
      })),
    };
  }

  @Delete('delete')
  async deleteRoom(
    @Body('meetingId') meetingId: string,
    @Body('userId') userId: string,
  ) {
    await this.meetingsService.deleteRoomMeeting(meetingId, userId);
    return { message: 'Room deleted successfully' };
  }

  @Get('participants')
  async getParticipants(@Query('meetingId') meetingId: string) {
    const participants =
      await this.meetingsService.getParticipantsInMeeting(meetingId);
    return {
      success: true,
      data: participants.map((participant) => ({
        userId: participant.userId,
        userName: participant.user?.username || 'Unknown',
        userAvatarUrl: participant.user?.avatarImg || null,
        joinTime: participant.joinTime,
        hasCamera: participant.hasCamera,
        hasMicrophone: participant.hasMicrophone,
        isScreenSharing: participant.isScreenSharing,
      })),
    };
  }
}
