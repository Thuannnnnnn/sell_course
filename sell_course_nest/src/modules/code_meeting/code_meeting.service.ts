import { Injectable } from '@nestjs/common';

@Injectable()
export class CodeMeetingService {
  private rooms: Map<string, CodeMeetingRoom> = new Map();

  createRoom(
    roomId: string,
    participant: CodeMeetingParticipant,
  ): CodeMeetingRoom {
    const newRoom: CodeMeetingRoom = {
      roomId,
      participants: [participant],
      code: '',
    };
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getRoom(roomId: string): CodeMeetingRoom | undefined {
    return this.rooms.get(roomId);
  }

  addParticipant(roomId: string, participant: CodeMeetingParticipant): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.participants.push(participant);
    return true;
  }

  removeParticipant(roomId: string, socketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const index = room.participants.findIndex((p) => p.socketId === socketId);
    if (index === -1) return false;
    room.participants.splice(index, 1);
    if (room.participants.length === 0) {
      this.rooms.delete(roomId);
    }
    return true;
  }

  updateCode(roomId: string, code: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.code = code;
    return true;
  }

  getAllParticipants(roomId: string): CodeMeetingParticipant[] {
    const room = this.rooms.get(roomId);
    return room ? room.participants : [];
  }
}

export interface CodeMeetingParticipant {
  socketId: string;
  userId: string;
  username: string;
}

export interface CodeMeetingRoom {
  roomId: string;
  participants: CodeMeetingParticipant[];
  code: string;
}
