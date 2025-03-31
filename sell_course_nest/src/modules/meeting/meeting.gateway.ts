import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MeetingGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(client: Socket, payload: { meetingId: string; userId: string }) {
    const { meetingId, userId } = payload;
    client.join(meetingId);
    
    this.server.to(meetingId).emit('participant-joined', {
      userId,
      hasCamera: false,
      hasMicrophone: false,
      isScreenSharing: false
    });
  }

  // Xóa các handlers liên quan đến chat
  // @SubscribeMessage('send-message')
  // handleMessage(client: Socket, payload: any) { ... }

  // Giữ lại các handlers khác
  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: { to: string; offer: RTCSessionDescriptionInit }) {
    client.to(payload.to).emit('offer', {
      offer: payload.offer,
      from: client.id
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { to: string; answer: RTCSessionDescriptionInit }) {
    client.to(payload.to).emit('answer', {
      answer: payload.answer,
      from: client.id
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: { to: string; candidate: RTCIceCandidateInit }) {
    client.to(payload.to).emit('ice-candidate', {
      candidate: payload.candidate,
      from: client.id
    });
  }
}
