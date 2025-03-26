import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CodeMeetingService } from './code_meeting.service';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
@Injectable()
export class CodeMeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly codeMeetingService: CodeMeetingService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected to code meeting: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from code meeting: ${client.id}`);
    this.handleParticipantDisconnect(client);
  }

  private handleParticipantDisconnect(client: Socket) {
    for (const room of this.codeMeetingService['rooms'].entries()) {
      const [roomId, roomData] = room;
      const participantIndex = roomData.participants.findIndex(
        (p) => p.socketId === client.id,
      );
      if (participantIndex !== -1) {
        this.codeMeetingService.removeParticipant(roomId, client.id);
        this.server.to(roomId).emit('participantLeft', {
          socketId: client.id,
          remainingParticipants:
            this.codeMeetingService.getAllParticipants(roomId),
        });
        break;
      }
    }
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    client: Socket,
    payload: { userId: string; username: string },
  ): void {
    const roomId = `room_${Date.now()}`;
    const newRoom = this.codeMeetingService.createRoom(roomId, {
      socketId: client.id,
      userId: payload.userId,
      username: payload.username,
    });
    client.join(roomId);
    client.emit('roomCreated', { roomId, room: newRoom });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { roomId: string; userId: string; username: string },
  ): void {
    const room = this.codeMeetingService.getRoom(payload.roomId);
    if (!room) {
      client.emit('error', { message: 'Room not found' });
      return;
    }
    const participant = {
      socketId: client.id,
      userId: payload.userId,
      username: payload.username,
    };
    this.codeMeetingService.addParticipant(payload.roomId, participant);
    client.join(payload.roomId);
    this.server.to(payload.roomId).emit('participantJoined', {
      newParticipant: participant,
      participants: this.codeMeetingService.getAllParticipants(payload.roomId),
      currentCode: room.code,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, payload: { roomId: string }): void {
    client.leave(payload.roomId);
    this.handleParticipantDisconnect(client);
  }

  @SubscribeMessage('codeUpdate')
  handleCodeUpdate(
    client: Socket,
    payload: { roomId: string; code: string },
  ): void {
    const success = this.codeMeetingService.updateCode(
      payload.roomId,
      payload.code,
    );
    if (success) {
      client.to(payload.roomId).emit('codeUpdated', { code: payload.code });
    }
  }

  @SubscribeMessage('signal')
  handleSignal(
    client: Socket,
    payload: { roomId: string; to: string; signal: any },
  ): void {
    this.server
      .to(payload.to)
      .emit('signal', { from: client.id, signal: payload.signal });
  }
}
