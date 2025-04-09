import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeetingsService } from './meeting.service';

interface SocketData {
  user?: { userId: string };
}

interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

interface UpdateParticipantStatusData {
  meetingId: string;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/socket.io' })
export class MeetingsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly meetingsService: MeetingsService) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { meetingId: string; userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { meetingId, userId } = data;

    client.join(meetingId);
    this.server.to(meetingId).emit('userJoined', { userId });

    try {
      const participants =
        await this.meetingsService.getParticipantsInMeeting(meetingId);
      this.server.to(meetingId).emit('participantsUpdate', participants);
    } catch (error) {
      console.error('Error getting participants:', error);
    }

    return { event: 'joined', meetingId, userId };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { meetingId: string; userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { meetingId, userId } = data;

    const participant = await this.meetingsService
      .getParticipantsInMeeting(meetingId)
      .then((participants) => participants.find((p) => p.userId === userId));

    if (participant?.role === 'host') {
      await this.meetingsService.leaveAll(meetingId, userId);
      this.server.to(meetingId).emit('roomClosed');
    } else {
      await this.meetingsService.leaveRoomAlone(meetingId, userId);
      this.server.to(meetingId).emit('userLeft', { userId });
      const participants =
        await this.meetingsService.getParticipantsInMeeting(meetingId);
      this.server.to(meetingId).emit('participantsUpdate', participants);
    }

    client.leave(meetingId);
  }

  @SubscribeMessage('getParticipants')
  async handleGetParticipants(
    @MessageBody() data: { meetingId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const participants = await this.meetingsService.getParticipantsInMeeting(
        data.meetingId,
      );
      client.emit('participantsUpdate', participants);
    } catch (error) {
      console.error('Error getting participants:', error);
      client.emit('error', { message: 'Failed to get participants' });
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: { to: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { to, offer } = data;
    this.server.to(to).emit('offer', { from: client.id, offer });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: { to: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { to, answer } = data;
    this.server.to(to).emit('answer', { from: client.id, answer });
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @MessageBody() data: { to: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { to, candidate } = data;
    this.server.to(to).emit('iceCandidate', { from: client.id, candidate });
  }

  @SubscribeMessage('updateParticipantStatus')
  async handleUpdateParticipantStatus(
    @MessageBody() data: UpdateParticipantStatusData,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const userId = client.data.user?.userId;

      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      await this.meetingsService.updateParticipantStatus({
        ...data,
        userId,
      });

      const participants = await this.meetingsService.getParticipantsInMeeting(
        data.meetingId,
      );
      this.server.to(data.meetingId).emit('participantsUpdate', participants);
    } catch (error) {
      console.error('Error updating participant status:', error);
      client.emit('error', { message: 'Failed to update status' });
    }
  }
}
