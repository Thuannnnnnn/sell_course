import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MeetingsService } from './meeting.service';
@WebSocketGateway()
export class MeetingsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly meetingsService: MeetingsService) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { meetingId: string; userId: string },
  ) {
    const { meetingId, userId } = data;
    this.server.to(meetingId).emit('userJoined', { userId });

    // Gửi danh sách participants cập nhật
    const participants =
      await this.meetingsService.getParticipantsInMeeting(meetingId);
    this.server.to(meetingId).emit('participantsUpdate', participants);
    return { event: 'joined', meetingId, userId };
  }

  // Cập nhật danh sách participants khi có người leave
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { meetingId: string; userId: string; isHost: boolean },
  ) {
    const { meetingId, userId, isHost } = data;
    if (isHost) {
      await this.meetingsService.leaveAll(meetingId, userId);
      this.server.to(meetingId).emit('roomClosed');
    } else {
      await this.meetingsService.leaveRoomAlone(meetingId, userId);
      this.server.to(meetingId).emit('userLeft', { userId });
      const participants =
        await this.meetingsService.getParticipantsInMeeting(meetingId);
      this.server.to(meetingId).emit('participantsUpdate', participants);
    }
  }

  // Lấy danh sách participants theo yêu cầu
  @SubscribeMessage('getParticipants')
  async handleGetParticipants(@MessageBody() data: { meetingId: string }) {
    const participants = await this.meetingsService.getParticipantsInMeeting(
      data.meetingId,
    );
    this.server.to(data.meetingId).emit('participantsUpdate', participants);
  }
}
