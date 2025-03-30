import { User } from "../user/User";

export interface MeetingDetails {
  id: string;
  title: string;
  description?: string;
  host: User;
  isActive: boolean;
  startTime: string;
  endTime?: string;
  isScheduled: boolean;
  scheduledTime?: string;
  isRecorded: boolean;
  participants?: User[];
}

export interface Meeting extends MeetingDetails {
  hostId: string;
}

export interface MeetingParticipant {
  userId: string;
  meetingId: string;
  joinTime: string;
  leaveTime?: string;
  role: "host" | "participant";
}
