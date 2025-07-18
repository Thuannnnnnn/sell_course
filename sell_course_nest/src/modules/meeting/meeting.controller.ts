import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Query,
  UseGuards,
  Req,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MeetingsService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';

interface AuthenticatedRequest extends Request {
  user: {
    user_id: string;
  };
}
@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post('create')
  async createRoom(
    @Body() createMeetingDto: CreateMeetingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      console.log('req.user:', req.user); // Log để kiểm tra
      const hostId = req.user?.user_id;
      if (!hostId) {
        throw new HttpException(
          'Unauthorized: Missing user ID',
          HttpStatus.UNAUTHORIZED,
        );
      }

      console.log('Creating meeting with hostId:', hostId); // Log để kiểm tra

      const meetingData = {
        ...createMeetingDto,
        hostId,
      };
      console.log('Meeting data sent to service:', meetingData); // Log thêm để kiểm tra

      const meeting = await this.meetingsService.createRoomMeeting(meetingData);
      return {
        success: true,
        data: {
          id: meeting.id,
          meetingCode: meeting.meetingCode,
        },
      };
    } catch (error) {
      console.error('Error in createRoom:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to create meeting',
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('join')
  async joinRoom(
    @Body() joinMeetingDto: JoinMeetingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Sử dụng userId từ token JWT
    const userId = req.user.user_id;
    const meeting = await this.meetingsService.joinRoomMeeting(
      joinMeetingDto.meetingCode,
      userId,
    );
    return { meetingId: meeting.id, meetingCode: meeting.meetingCode };
  }

  @Get('joined')
  async getJoinedMeetings(@Req() req: AuthenticatedRequest) {
    // Sử dụng userId từ token JWT
    const userId = req.user.user_id;
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
  async getHostedMeetings(@Req() req: AuthenticatedRequest) {
    // Sử dụng userId từ token JWT
    const userId = req.user.user_id;
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
    @Req() req: AuthenticatedRequest,
  ) {
    // Sử dụng userId từ token JWT
    const userId = req.user.user_id;
    await this.meetingsService.deleteRoomMeeting(meetingId, userId);
    return { message: 'Room deleted successfully' };
  }

  @Get('participants')
  async getParticipants(
    @Query('meetingId') meetingId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Xác thực người dùng đã đăng nhập trước khi lấy danh sách người tham gia
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

  @Put('participant/status')
  async updateParticipantStatus(
    @Body() updateData: UpdateParticipantStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        throw new HttpException(
          'Unauthorized: Missing user ID',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const updatedParticipant =
        await this.meetingsService.updateParticipantStatus({
          ...updateData,
          userId,
        });

      return {
        success: true,
        data: {
          userId: updatedParticipant.userId,
          hasCamera: updatedParticipant.hasCamera,
          hasMicrophone: updatedParticipant.hasMicrophone,
          isScreenSharing: updatedParticipant.isScreenSharing,
        },
      };
    } catch (error) {
      console.error('Error in updateParticipantStatus:', error);
      throw new HttpException(
        'Failed to update participant status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
