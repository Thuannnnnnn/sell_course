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
import { Logger } from '@nestjs/common';

@ApiTags('meetings')
@ApiBearerAuth('Authorization')
@Controller('meetings')
export class MeetingController {
  private readonly logger: Logger = new Logger('MeetingController');

  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meeting' })
  @ApiResponse({ status: 201, description: 'Meeting created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMeeting(@Body() createMeetingDto: CreateMeetingDto) {
    try {
      this.logger.log(`Creating meeting with DTO: ${JSON.stringify(createMeetingDto)}`);
      const meeting = await this.meetingService.createMeeting(createMeetingDto);
      this.logger.log(`Meeting created successfully: ${meeting.id}, code: ${meeting.meetingCode}`);
      return {
        success: true,
        message: 'Meeting created successfully',
        data: meeting,
      };
    } catch (error) {
      this.logger.error('Error creating meeting:', error);
      if (error instanceof HttpException) {
        throw error;
      }
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
      this.logger.log('Fetching all active meetings');
      const meetings = await this.meetingService.getActiveMeetings();
      this.logger.log(`Found ${meetings.length} active meetings`);
      return {
        success: true,
        data: meetings,
      };
    } catch (error) {
      this.logger.error('Error fetching active meetings:', error);
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
      this.logger.log(`Fetching meetings for user ${userId}, type: ${type}`);
      let meetings;
      if (type === 'hosted') {
        meetings = await this.meetingService.getUserMeetings(userId);
      } else {
        meetings = await this.meetingService.getUserParticipatedMeetings(userId);
      }
      this.logger.log(`Found ${meetings.length} meetings for user ${userId}`);
      return {
        success: true,
        data: meetings,
      };
    } catch (error) {
      this.logger.error(`Error fetching meetings for user ${userId}:`, error);
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
      this.logger.log(`Fetching meeting with ID or code: ${meetingId}`);
      const meeting = await this.meetingService.getMeeting(meetingId);
      this.logger.log(`Meeting found: ${meeting.id}, code: ${meeting.meetingCode}`);
      return {
        success: true,
        data: meeting,
      };
    } catch (error) {
      this.logger.error(`Error fetching meeting ${meetingId}:`, error);
      throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a meeting' })
  @ApiResponse({ status: 200, description: 'Successfully joined meeting' })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  async joinMeeting(@Body() joinMeetingDto: JoinMeetingDto) {
    try {
      this.logger.log(
        `Attempting to join meeting with ID or code: ${joinMeetingDto.meetingId} for user: ${joinMeetingDto.userId}`,
      );
      const participant = await this.meetingService.joinMeeting(joinMeetingDto);
      this.logger.log(
        `Successfully joined meeting with ID: ${participant.meetingId} for user: ${joinMeetingDto.userId}`,
      );
      return {
        success: true,
        message: 'Successfully joined meeting',
        data: participant,
      };
    } catch (error) {
      this.logger.error('Error joining meeting:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to join meeting', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('leave')
  @ApiOperation({ summary: 'Leave a meeting' })
  @ApiResponse({ status: 200, description: 'Successfully left meeting' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async leaveMeeting(@Body() body: { meetingId: string; userId: string }) {
    try {
      this.logger.log(`User ${body.userId} attempting to leave meeting ${body.meetingId}`);
      await this.meetingService.leaveMeeting(body.meetingId, body.userId);
      this.logger.log(`User ${body.userId} successfully left meeting ${body.meetingId}`);
      return {
        success: true,
        message: 'Successfully left meeting',
      };
    } catch (error) {
      this.logger.error(`Error leaving meeting ${body.meetingId}:`, error);
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
      this.logger.log(`Host ${body.hostId} attempting to end meeting ${body.meetingId}`);
      const meeting = await this.meetingService.endMeeting(
        body.meetingId,
        body.hostId,
      );
      this.logger.log(`Meeting ${body.meetingId} ended successfully by host ${body.hostId}`);
      return {
        success: true,
        message: 'Meeting ended successfully',
        data: meeting,
      };
    } catch (error) {
      this.logger.error(`Error ending meeting ${body.meetingId}:`, error);
      throw new HttpException('Failed to end meeting', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('participant/status')
  @ApiOperation({ summary: 'Update participant status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async updateParticipantStatus(@Body() updateDto: UpdateParticipantStatusDto) {
    try {
      this.logger.log(`Updating participant status for user ${updateDto.userId} in meeting ${updateDto.meetingId}`);
      const participant = await this.meetingService.updateParticipantStatus(updateDto);
      this.logger.log(`Participant status updated for user ${updateDto.userId}`);
      return {
        success: true,
        message: 'Status updated successfully',
        data: participant,
      };
    } catch (error) {
      this.logger.error(`Error updating participant status:`, error);
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
      this.logger.log(`Sending message in meeting ${sendMessageDto.meetingId} from user ${sendMessageDto.senderId}`);
      const message = await this.meetingService.sendMessage(sendMessageDto);
      this.logger.log(`Message sent successfully in meeting ${sendMessageDto.meetingId}`);
      return {
        success: true,
        message: 'Message sent successfully',
        data: message,
      };
    } catch (error) {
      this.logger.error(`Error sending message in meeting ${sendMessageDto.meetingId}:`, error);
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
      this.logger.log(`Fetching messages for meeting ${meetingId} for user ${userId}`);
      const messages = await this.meetingService.getMeetingMessages(
        meetingId,
        userId,
      );
      this.logger.log(`Found ${messages.length} messages for meeting ${meetingId}`);
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      this.logger.error(`Error fetching messages for meeting ${meetingId}:`, error);
      throw new HttpException('Failed to get messages', HttpStatus.BAD_REQUEST);
    }
  }
}