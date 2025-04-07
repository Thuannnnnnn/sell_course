import { User } from "../user/User";

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  host: User;
  hostId: string;
  isActive: boolean;
  startTime: string;
  endTime?: string;
  isScheduled: boolean;
  scheduledTime?: string;
  isRecorded: boolean;
  participants?: MeetingParticipant[];
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  user?: User;
  joinTime: string;
  leaveTime?: string;
  isActive: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
  role: 'host' | 'participant'; // Thêm role
}

// Các type khác giữ nguyên...

// Type cho participant stream từ useMeetingSocket
export interface ParticipantStream {
  userId: string;
  stream: MediaStream;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
}

// Type cho tin nhắn trong chat
export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  senderName: string;
}

// Định nghĩa type cho một meeting cơ bản
export interface Meeting {
  id: string;
  title: string;
  meetingCode: string;
  startTime: string; // Hoặc Date nếu backend trả về định dạng khác
  isActive: boolean;
}

// Type cho hosted meeting (có thêm participantCount)
export interface HostedMeeting extends Meeting {
  participantCount: number;
}

// Type cho joined meeting (có thêm hostName và isHost)
export interface JoinedMeeting extends Meeting {
  hostName?: string;
  isHost?: boolean;
}
