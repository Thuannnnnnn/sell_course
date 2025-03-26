import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  CodeMeetingParticipant,
  CodeMeetingService,
} from './code_meeting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateRoomDto,
  JoinRoomDto,
  LeaveRoomDto,
  RoomResponseDto,
} from '././dto/code-meeting.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('code-meeting')
@UseGuards(JwtAuthGuard)
export class CodeMeetingController {
  constructor(private readonly codeMeetingService: CodeMeetingService) {
    console.log('CodeMeetingController initialized'); // Confirm instantiation
  }

  @Post('rooms')
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    const roomId = uuidv4();
    const room = this.codeMeetingService.createRoom(roomId, {
      socketId: '',
      userId: createRoomDto.userId,
      username: createRoomDto.username,
    });
    return room;
  }

  @Post('rooms/join')
  async joinRoom(@Body() joinRoomDto: JoinRoomDto): Promise<RoomResponseDto> {
    const room = this.codeMeetingService.getRoom(joinRoomDto.roomId);
    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }
    const success = this.codeMeetingService.addParticipant(joinRoomDto.roomId, {
      socketId: '', // Socket ID will be set via WebSocket
      userId: joinRoomDto.userId,
      username: joinRoomDto.username,
    });
    if (!success) {
      throw new HttpException('Failed to join room', HttpStatus.BAD_REQUEST);
    }
    return this.codeMeetingService.getRoom(joinRoomDto.roomId);
  }

  @Post('rooms/leave')
  async leaveRoom(
    @Body() leaveRoomDto: LeaveRoomDto,
  ): Promise<{ success: boolean }> {
    const success = this.codeMeetingService.removeParticipant(
      leaveRoomDto.roomId,
      '',
    );
    if (!success) {
      throw new HttpException('Failed to leave room', HttpStatus.BAD_REQUEST);
    }
    return { success: true };
  }

  @Get('rooms/:roomId')
  async getRoom(
    @Param('roomId') roomId: string,
  ): Promise<RoomResponseDto | null> {
    return this.codeMeetingService.getRoom(roomId) || null;
  }

  @Get('rooms/:roomId/participants')
  async getRoomParticipants(
    @Param('roomId') roomId: string,
  ): Promise<CodeMeetingParticipant[]> {
    return this.codeMeetingService.getAllParticipants(roomId);
  }
}
