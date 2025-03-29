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
import { MeetingParticipant } from './entities/meeting-participant.entity';

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

    // Join the meeting room
    client.join(meetingId);

    try {
      // Fetch the meeting and its participants
      const meeting = await this.meetingService.getMeeting(meetingId);
      const participants = meeting.participants || [];

      this.logger.log(`Emitting current-participants to client ${client.id}:`, participants);

      // Emit the current participants to the newly connected client
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
      // Mark the participant as inactive
      await this.meetingService.leaveMeeting(meetingId, userId);

      // Notify other clients in the room
      this.server.to(meetingId).emit('participant-left', { userId });

      // Fetch updated participants list and emit to all clients
      const meeting = await this.meetingService.getMeeting(meetingId);
      const participants = meeting.participants || [];
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
      // Join the meeting using the MeetingService
      const participant = await this.meetingService.joinMeeting({
        meetingId,
        userId,
        hasCamera: false,
        hasMicrophone: false,
      });

      // Join the Socket.IO room
      client.join(meetingId);

      // Fetch the updated meeting with participants
      const meeting = await this.meetingService.getMeeting(meetingId);
      const participants = meeting.participants || [];

      this.logger.log(`Emitting current-participants to all clients in meeting ${meetingId}:`, participants);

      // Emit the updated participants list to all clients in the room
      this.server.to(meetingId).emit('current-participants', participants);

      this.logger.log(`Emitting participant-joined to other clients in meeting ${meetingId}:`, participant);

      // Emit participant-joined event to other clients in the room
      client.to(meetingId).emit('participant-joined', { participant });
    } catch (error) {
      this.logger.error(`Error joining meeting`);
      client.emit('error', { message: 'Failed to join meeting' });
    }
  }

  @SubscribeMessage('update-status')
  async handleUpdateStatus(
    client: Socket,
    payload: { meetingId: string; userId: string; hasCamera: boolean; hasMicrophone: boolean; isScreenSharing: boolean }
  ) {
    const { meetingId, userId, hasCamera, hasMicrophone, isScreenSharing } = payload;

    this.logger.log(`Received update-status from client ${client.id}:`, payload);

    try {
      // Update participant status using the MeetingService
      await this.meetingService.updateParticipantStatus({
        meetingId,
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

      // Emit participant-status-updated to all clients in the room
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
  async handleSendMessage(client: Socket, payload: { meetingId: string; senderId: string; message: string; isPrivate?: boolean; receiverId?: string }) {
    const { meetingId, senderId, message, isPrivate = false, receiverId } = payload;

    this.logger.log(`Received send-message from client ${client.id}:`, payload);

    try {
      // Save the message using the MeetingService
      const newMessage = await this.meetingService.sendMessage({
        meetingId,
        senderId,
        message,
        isPrivate,
        receiverId,
      });

      if (isPrivate && receiverId) {
        // Emit private message to the sender and receiver
        const senderSocket = Array.from(this.server.sockets.sockets.values()).find(
          (socket) => socket.handshake.query.userId === senderId
        );
        const receiverSocket = Array.from(this.server.sockets.sockets.values()).find(
          (socket) => socket.handshake.query.userId === receiverId
        );

        if (senderSocket) {
          senderSocket.emit('private-message', newMessage);
        }
        if (receiverSocket) {
          receiverSocket.emit('private-message', newMessage);
        }
      } else {
        // Emit public message to all clients in the room
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
  handleIceCandidate(client: Socket, payload: { to: string; candidate: any }) {
    const { to, candidate } = payload;
    this.logger.log(`Received ice-candidate from client ${client.id}:`, payload);
    const targetSocket = Array.from(this.server.sockets.sockets.values()).find(
      (socket) => socket.handshake.query.userId === to
    );
    if (targetSocket) {
      targetSocket.emit('ice-candidate', { from: client.handshake.query.userId, candidate });
    }
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: { to: string; offer: any }) {
    const { to, offer } = payload;
    this.logger.log(`Received offer from client ${client.id}:`, payload);
    const targetSocket = Array.from(this.server.sockets.sockets.values()).find(
      (socket) => socket.handshake.query.userId === to
    );
    if (targetSocket) {
      targetSocket.emit('offer', { from: client.handshake.query.userId, offer });
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { to: string; answer: any }) {
    const { to, answer } = payload;
    this.logger.log(`Received answer from client ${client.id}:`, payload);
    const targetSocket = Array.from(this.server.sockets.sockets.values()).find(
      (socket) => socket.handshake.query.userId === to
    );
    if (targetSocket) {
      targetSocket.emit('answer', { from: client.handshake.query.userId, answer });
    }
  }
}