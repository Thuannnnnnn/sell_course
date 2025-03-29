import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('meetings')
@ApiBearerAuth('Authorization')
@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meeting' })
  @ApiResponse({ status: 201, description: 'Meeting created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMeeting(@Body() createMeetingDto: CreateMeetingDto) {
    try {
      const meeting = await this.meetingService.createMeeting(createMeetingDto);
      return {
        success: true,
        message: 'Meeting created successfully',
        data: meeting,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create meeting',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all active meetings' })
  @ApiResponse({ status: 200, description: 'Returns all active meetings' })
  async getActiveMeetings() {
    try {
      const meetings = await this.meetingService.getActiveMeetings();
      return {
        success: true,
        data: meetings,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to get meetings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get meetings for a user' })
  @ApiResponse({ status: 200, description: 'Returns user meetings' })
  async getUserMeetings(
    @Param('userId') userId: string,
    @Query('type') type: 'hosted' | 'participated' = 'hosted',
  ) {
    try {
      let meetings;
      if (type === 'hosted') {
        meetings = await this.meetingService.getUserMeetings(userId);
      } else {
        meetings =
          await this.meetingService.getUserParticipatedMeetings(userId);
      }

      return {
        success: true,
        data: meetings,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to get user meetings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':meetingId')
  @ApiOperation({ summary: 'Get meeting details by ID or code' })
  @ApiResponse({ status: 200, description: 'Returns meeting details' })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  async getMeeting(@Param('meetingId') meetingId: string) {
    try {
      const meeting = await this.meetingService.getMeeting(meetingId);
      return {
        success: true,
        data: meeting,
      };
    } catch (error) {
      throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a meeting' })
  @ApiResponse({ status: 200, description: 'Successfully joined meeting' })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  async joinMeeting(@Body() joinMeetingDto: JoinMeetingDto) {
    try {
      const participant = await this.meetingService.joinMeeting(joinMeetingDto);
      return {
        success: true,
        message: 'Successfully joined meeting',
        data: participant,
      };
    } catch (error) {
      throw new HttpException('Failed to join meeting', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('leave')
  @ApiOperation({ summary: 'Leave a meeting' })
  @ApiResponse({ status: 200, description: 'Successfully left meeting' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async leaveMeeting(@Body() body: { meetingId: string; userId: string }) {
    try {
      await this.meetingService.leaveMeeting(body.meetingId, body.userId);
      return {
        success: true,
        message: 'Successfully left meeting',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to leave meeting',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('end')
  @ApiOperation({ summary: 'End a meeting (host only)' })
  @ApiResponse({ status: 200, description: 'Meeting ended successfully' })
  @ApiResponse({ status: 404, description: 'Meeting not found or not host' })
  async endMeeting(@Body() body: { meetingId: string; hostId: string }) {
    try {
      const meeting = await this.meetingService.endMeeting(
        body.meetingId,
        body.hostId,
      );
      return {
        success: true,
        message: 'Meeting ended successfully',
        data: meeting,
      };
    } catch (error) {
      throw new HttpException('Failed to end meeting', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('participant/status')
  @ApiOperation({ summary: 'Update participant status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async updateParticipantStatus(@Body() updateDto: UpdateParticipantStatusDto) {
    try {
      const participant =
        await this.meetingService.updateParticipantStatus(updateDto);
      return {
        success: true,
        message: 'Status updated successfully',
        data: participant,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('message')
  @ApiOperation({ summary: 'Send a message in the meeting' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      const message = await this.meetingService.sendMessage(sendMessageDto);
      return {
        success: true,
        message: 'Message sent successfully',
        data: message,
      };
    } catch (error) {
      throw new HttpException('Failed to send message', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':meetingId/messages')
  @ApiOperation({ summary: 'Get meeting messages' })
  @ApiResponse({ status: 200, description: 'Returns meeting messages' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getMeetingMessages(
    @Param('meetingId') meetingId: string,
    @Query('userId') userId: string,
  ) {
    try {
      const messages = await this.meetingService.getMeetingMessages(
        meetingId,
        userId,
      );
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      throw new HttpException('Failed to get messages', HttpStatus.BAD_REQUEST);
    }
  }
}
