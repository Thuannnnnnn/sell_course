export interface CreateRoomDto {
  userId: string;
  username: string;
}

export interface JoinRoomDto {
  roomId: string;
  userId: string;
  username: string;
}

export interface LeaveRoomDto {
  roomId: string;
}

export interface CodeUpdateDto {
  roomId: string;
  code: string;
}

export interface SignalDto {
  roomId: string;
  to: string;
  signal: any;
}

export interface RoomResponseDto {
  roomId: string;
  participants: {
    socketId: string;
    userId: string;
    username: string;
  }[];
  code: string;
}
