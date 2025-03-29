import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { MeetingMessage } from './entities/meeting-message.entity';
import { MeetingService } from './meeting.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'meetings',
})
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MeetingGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly meetingService: MeetingService,
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    @InjectRepository(MeetingParticipant)
    private participantRepository: Repository<MeetingParticipant>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const { meetingId, userId } = client.handshake.query;

      if (!meetingId || !userId) {
        client.disconnect();
        return;
      }

      this.logger.log(
        `Client connected: ${client.id} - User: ${userId} - Meeting: ${meetingId}`,
      );

      // Join the meeting room
      client.join(meetingId as string);

      // Store user and meeting info in socket data
      client.data.meetingId = meetingId;
      client.data.userId = userId;

      // Notify others that a new participant has joined
      const participant = await this.participantRepository.findOne({
        where: {
          meetingId: meetingId as string,
          userId: userId as string,
          isActive: true,
        },
        relations: ['user'],
      });

      if (participant) {
        this.server.to(meetingId as string).emit('participant-joined', {
          participant,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(`Error in handleConnection: no connection 1`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const meetingId = client.data.meetingId as string;
      const userId = client.data.userId as string;

      if (meetingId && userId) {
        this.logger.log(
          `Client disconnected: ${client.id} - User: ${userId} - Meeting: ${meetingId}`,
        );

        // Update participant status
        await this.meetingService.leaveMeeting(meetingId, userId);

        // Notify others that participant has left
        this.server.to(meetingId).emit('participant-left', {
          userId,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(`Error in handleConnection: no connection 2`);
    }
  }

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(
    client: Socket,
    data: { meetingId: string; userId: string },
  ) {
    try {
      const { meetingId, userId } = data;

      // Join the meeting room
      client.join(meetingId);

      // Get all active participants
      const meeting = await this.meetingRepository.findOne({
        where: { id: meetingId },
        relations: ['participants', 'participants.user'],
      });

      if (!meeting) {
        throw new WsException('Meeting not found');
      }

      // Send current participants to the new joiner
      const activeParticipants = meeting.participants.filter((p) => p.isActive);
      client.emit('current-participants', activeParticipants);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error in join-meeting`);
      return { success: false, error: 'Meeting not found' };
    }
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, data: { to: string; offer: any }) {
    const { to, offer } = data;
    this.server.to(to).emit('offer', {
      from: client.id,
      offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, data: { to: string; answer: any }) {
    const { to, answer } = data;
    this.server.to(to).emit('answer', {
      from: client.id,
      answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, data: { to: string; candidate: any }) {
    const { to, candidate } = data;
    this.server.to(to).emit('ice-candidate', {
      from: client.id,
      candidate,
    });
  }

  @SubscribeMessage('update-status')
  async handleUpdateStatus(
    client: Socket,
    data: {
      meetingId: string;
      userId: string;
      hasCamera: boolean;
      hasMicrophone: boolean;
      isScreenSharing: boolean;
    },
  ) {
    try {
      const { meetingId, userId, hasCamera, hasMicrophone, isScreenSharing } =
        data;

      // Update participant status
      await this.meetingService.updateParticipantStatus({
        meetingId,
        userId,
        hasCamera,
        hasMicrophone,
        isScreenSharing,
      });

      // Notify all participants about the status change
      this.server.to(meetingId).emit('participant-status-updated', {
        userId,
        hasCamera,
        hasMicrophone,
        isScreenSharing,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error in update-status`);
      return { success: false, error: 'Unable to update participant status' };
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    client: Socket,
    data: {
      meetingId: string;
      senderId: string;
      message: string;
      isPrivate?: boolean;
      receiverId?: string;
    },
  ) {
    try {
      const { meetingId, senderId, message, isPrivate, receiverId } = data;

      const savedMessage = await this.meetingService.sendMessage({
        meetingId,
        senderId,
        message,
        isPrivate,
        receiverId,
      });

      if (isPrivate && receiverId) {
        const receiverSockets = await this.server.in(meetingId).fetchSockets();
        const receiverSocket = receiverSockets.find(
          (socket) => socket.data.userId === receiverId,
        );

        if (receiverSocket) {
          receiverSocket.emit('new-message', savedMessage);
          client.emit('new-message', savedMessage);
        }
      } else {
        this.server.to(meetingId).emit('new-message', savedMessage);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error in send-message`);
      return { success: false, error: 'error sending message' };
    }
  }

  @SubscribeMessage('start-recording')
  handleStartRecording(client: Socket, data: { meetingId: string }) {
    const { meetingId } = data;
    this.server.to(meetingId).emit('recording-started', {
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('stop-recording')
  handleStopRecording(client: Socket, data: { meetingId: string }) {
    const { meetingId } = data;
    this.server.to(meetingId).emit('recording-stopped', {
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('raise-hand')
  handleRaiseHand(client: Socket, data: { meetingId: string; userId: string }) {
    const { meetingId, userId } = data;
    this.server.to(meetingId).emit('hand-raised', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('lower-hand')
  handleLowerHand(client: Socket, data: { meetingId: string; userId: string }) {
    const { meetingId, userId } = data;
    this.server.to(meetingId).emit('hand-lowered', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('share-screen')
  handleShareScreen(
    client: Socket,
    data: { meetingId: string; userId: string },
  ) {
    const { meetingId, userId } = data;
    this.server.to(meetingId).emit('screen-shared', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('stop-screen-share')
  handleStopScreenShare(
    client: Socket,
    data: { meetingId: string; userId: string },
  ) {
    const { meetingId, userId } = data;
    this.server.to(meetingId).emit('screen-share-stopped', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('end-meeting')
  async handleEndMeeting(
    client: Socket,
    data: { meetingId: string; hostId: string },
  ) {
    try {
      const { meetingId, hostId } = data;

      // End the meeting
      await this.meetingService.endMeeting(meetingId, hostId);

      // Notify all participants that the meeting has ended
      this.server.to(meetingId).emit('meeting-ended', {
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error in end-meeting`);
      return { success: false, error: 'Error ending meeting' };
    }
  }
}
