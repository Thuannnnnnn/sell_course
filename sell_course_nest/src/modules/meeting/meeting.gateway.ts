import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeetingService } from './meeting.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/meetings', cors: { origin: '*' } })
export class MeetingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('MeetingGateway');

  constructor(private readonly meetingService: MeetingService) {}

  async handleConnection(client: Socket) {
    const meetingId = client.handshake.query.meetingId as string;
    const userId = client.handshake.query.userId as string;

    this.logger.log(`Client connected: ${client.id}, meetingId: ${meetingId}, userId: ${userId}`);

    if (!meetingId || !userId) {
      this.logger.warn(`Invalid connection parameters: meetingId=${meetingId}, userId=${userId}`);
      client.disconnect();
      return;
    }

    client.join(meetingId);

    try {
      const meeting = await this.meetingService.getMeeting(meetingId);
      const participants = meeting.participants || [];

      this.logger.log(`Emitting current-participants to client ${client.id}:`, participants);

      client.emit('current-participants', participants);
    } catch (error) {
      this.logger.error(`Error fetching meeting on connection`);
      client.emit('error', { message: 'Failed to fetch meeting participants' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const meetingId = client.handshake.query.meetingId as string;
    const userId = client.handshake.query.userId as string;

    this.logger.log(`Client disconnected: ${client.id}, meetingId: ${meetingId}, userId: ${userId}`);

    if (!meetingId || !userId) return;

    try {
      const meeting = await this.meetingService.getMeeting(meetingId);
      await this.meetingService.leaveMeeting(meeting.id, userId);
      this.server.to(meetingId).emit('participant-left', { userId });

      const updatedMeeting = await this.meetingService.getMeeting(meetingId);
      const participants = updatedMeeting.participants || [];
      this.server.to(meetingId).emit('current-participants', participants);
    } catch (error) {
      this.logger.error(`Error handling disconnect`);
    }
  }

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(client: Socket, payload: { meetingId: string; userId: string }) {
    const { meetingId, userId } = payload;

    this.logger.log(`Received join-meeting from client ${client.id}:`, payload);

    try {
      const participant = await this.meetingService.joinMeeting({
        meetingId,
        userId,
        hasCamera: false,
        hasMicrophone: false,
      });

      client.join(meetingId);

      const meeting = await this.meetingService.getMeeting(meetingId);
      const participants = meeting.participants || [];

      this.logger.log(`Emitting current-participants to all clients in meeting ${meetingId}:`, participants);

      this.server.to(meetingId).emit('current-participants', participants);

      this.logger.log(`Emitting participant-joined to other clients in meeting ${meetingId}:`, participant);

      client.to(meetingId).emit('participant-joined', { participant });
    } catch (error) {
      this.logger.error(`Error joining meeting`);
      client.emit('error', { message: 'Failed to join meeting' });
    }
  }

  @SubscribeMessage('update-status')
  async handleUpdateStatus(
    client: Socket,
    payload: {
      meetingId: string;
      userId: string;
      hasCamera: boolean;
      hasMicrophone: boolean;
      isScreenSharing: boolean;
    },
  ) {
    const { meetingId, userId, hasCamera, hasMicrophone, isScreenSharing } = payload;

    this.logger.log(`Received update-status from client ${client.id}:`, payload);

    try {
      const meeting = await this.meetingService.getMeeting(meetingId);
      await this.meetingService.updateParticipantStatus({
        meetingId: meeting.id,
        userId,
        hasCamera,
        hasMicrophone,
        isScreenSharing,
      });

      this.logger.log(`Emitting participant-status-updated to all clients in meeting ${meetingId}:`, {
        userId,
        hasCamera,
        hasMicrophone,
        isScreenSharing,
      });

      this.server.to(meetingId).emit('participant-status-updated', {
        userId,
        hasCamera,
        hasMicrophone,
        isScreenSharing,
      });
    } catch (error) {
      this.logger.error(`Error updating participant status`);
      client.emit('error', { message: 'Failed to update participant status' });
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    client: Socket,
    payload: {
      meetingId: string;
      senderId: string;
      message: string;
      isPrivate?: boolean;
      receiverId?: string;
    },
  ) {
    const { meetingId, senderId, message, isPrivate = false, receiverId } = payload;

    this.logger.log(`Received send-message from client ${client.id}:`, payload);

    try {
      const meeting = await this.meetingService.getMeeting(meetingId);
      const newMessage = await this.meetingService.sendMessage({
        meetingId: meeting.id,
        senderId,
        message,
        isPrivate,
        receiverId,
      });

      if (isPrivate && receiverId) {
        const sockets = await this.server.fetchSockets();
        const senderSocket = sockets.find(
          (socket) => socket.handshake.query.userId === senderId
        );
        const receiverSocket = sockets.find(
          (socket) => socket.handshake.query.userId === receiverId
        );

        if (senderSocket) {
          this.logger.log(`Emitting private-message to sender ${senderId}`);
          senderSocket.emit('private-message', newMessage);
        } else {
          this.logger.warn(`Sender socket for user ${senderId} not found`);
        }

        if (receiverSocket) {
          this.logger.log(`Emitting private-message to receiver ${receiverId}`);
          receiverSocket.emit('private-message', newMessage);
        } else {
          this.logger.warn(`Receiver socket for user ${receiverId} not found`);
        }
      } else {
        this.logger.log(`Emitting public message to meeting ${meetingId}`);
        this.server.to(meetingId).emit('message', newMessage);
      }
    } catch (error) {
      this.logger.error(`Error sending message`);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('raise-hand')
  handleRaiseHand(client: Socket, payload: { meetingId: string; userId: string }) {
    const { meetingId, userId } = payload;
    this.logger.log(`Received raise-hand from client ${client.id}:`, payload);
    this.server.to(meetingId).emit('hand-raised', { raisedHandUserId: userId });
  }

  @SubscribeMessage('lower-hand')
  handleLowerHand(client: Socket, payload: { meetingId: string; userId: string }) {
    const { meetingId, userId } = payload;
    this.logger.log(`Received lower-hand from client ${client.id}:`, payload);
    this.server.to(meetingId).emit('hand-lowered', { loweredHandUserId: userId });
  }

  @SubscribeMessage('screen-share-started')
  handleScreenShareStarted(client: Socket, payload: { meetingId: string; userId: string }) {
    const { meetingId, userId } = payload;
    this.logger.log(`Received screen-share-started from client ${client.id}:`, payload);
    this.server.to(meetingId).emit('screen-share-started', { sharingUserId: userId });
  }

  @SubscribeMessage('screen-share-stopped')
  handleScreenShareStopped(client: Socket, payload: { meetingId: string; userId: string }) {
    const { meetingId, userId } = payload;
    this.logger.log(`Received screen-share-stopped from client ${client.id}:`, payload);
    this.server.to(meetingId).emit('screen-share-stopped', { stoppedSharingUserId: userId });
  }

  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(client: Socket, payload: { to: string; candidate: any }) {
    const { to, candidate } = payload;
    this.logger.log(`Received ice-candidate from client ${client.id} for user ${to}:`, payload);

    try {
      const sockets = await this.server.fetchSockets();
      const targetSocket = sockets.find(
        (socket) => socket.handshake.query.userId === to
      );

      if (targetSocket) {
        this.logger.log(`Found target socket ${targetSocket.id} for user ${to}, emitting ice-candidate`);
        targetSocket.emit('ice-candidate', { from: client.handshake.query.userId, candidate });
      } else {
        this.logger.warn(`Target socket for user ${to} not found`);
        client.emit('error', { message: `User ${to} not found` });
      }
    } catch (error) {
      this.logger.error(`Error handling ice-candidate`);
      client.emit('error', { message: 'Failed to handle ICE candidate' });
    }
  }

  @SubscribeMessage('offer')
  async handleOffer(client: Socket, payload: { to: string; offer: any }) {
    const { to, offer } = payload;
    this.logger.log(`Received offer from client ${client.id} for user ${to}:`, payload);

    try {
      const sockets = await this.server.fetchSockets();
      const targetSocket = sockets.find(
        (socket) => socket.handshake.query.userId === to
      );

      if (targetSocket) {
        this.logger.log(`Found target socket ${targetSocket.id} for user ${to}, emitting offer`);
        targetSocket.emit('offer', { from: client.handshake.query.userId, offer });
      } else {
        this.logger.warn(`Target socket for user ${to} not found`);
        client.emit('error', { message: `User ${to} not found` });
      }
    } catch (error) {
      this.logger.error(`Error handling offer`);
      client.emit('error', { message: 'Failed to handle offer' });
    }
  }

  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, payload: { to: string; answer: any }) {
    const { to, answer } = payload;
    this.logger.log(`Received answer from client ${client.id} for user ${to}:`, payload);

    try {
      const sockets = await this.server.fetchSockets();
      const targetSocket = sockets.find(
        (socket) => socket.handshake.query.userId === to
      );

      if (targetSocket) {
        this.logger.log(`Found target socket ${targetSocket.id} for user ${to}, emitting answer`);
        targetSocket.emit('answer', { from: client.handshake.query.userId, answer });
      } else {
        this.logger.warn(`Target socket for user ${to} not found`);
        client.emit('error', { message: `User ${to} not found` });
      }
    } catch (error) {
      this.logger.error(`Error handling answer`);
      client.emit('error', { message: 'Failed to handle answer' });
    }
  }
}