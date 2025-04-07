import axios from "axios";
import { User } from "../../type/user/User";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  host?: User;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  isRecorded: boolean;
  recordingUrl?: string;
  isScheduled: boolean;
  scheduledTime?: string;
  meetingCode: string;
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
}

export interface MeetingMessage {
  id: string;
  meetingId: string;
  senderId: string;
  sender?: User;
  message: string;
  timestamp: string;
  isPrivate: boolean;
  receiverId?: string;
  receiver?: User;
}

// Create a new meeting
export const createMeeting = async (meetingData: {
  title: string;
  description?: string;
  hostId: string;
  isScheduled?: boolean;
  scheduledTime?: string;
  isRecorded?: boolean;
}) => {
  try {
    const response = await axios.post(`${API_URL}/meetings`, meetingData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};

// Get meeting by ID or code
export const getMeeting = async (meetingIdOrCode: string) => {
  try {
    const response = await axios.get(`${API_URL}/meetings/${meetingIdOrCode}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error getting meeting:", error);
    throw error;
  }
};

// Get all active meetings
export const getActiveMeetings = async () => {
  try {
    const response = await axios.get(`${API_URL}/meetings`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error getting active meetings:", error);
    throw error;
  }
};

// Get meetings for a user (hosted or participated)
export const getUserMeetings = async (
  userId: string,
  type: "hosted" | "participated" = "hosted"
) => {
  try {
    const response = await axios.get(
      `${API_URL}/meetings/user/${userId}?type=${type}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting user meetings:", error);
    throw error;
  }
};

// Join a meeting
export const joinMeeting = async (joinData: {
  meetingCode: string;
  userId: string;
  hasCamera?: boolean;
  hasMicrophone?: boolean;
}) => {
  try {
    const response = await axios.post(`${API_URL}/meetings/join`, joinData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error joining meeting:", error);
    throw error;
  }
};

// Leave a meeting
export const leaveMeeting = async (meetingId: string, userId: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/meetings/leave`,
      { meetingId, userId },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error leaving meeting:", error);
    throw error;
  }
};

// End a meeting (host only)
export const endMeeting = async (meetingId: string, hostId: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/meetings/end`,
      { meetingId, hostId },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error ending meeting:", error);
    throw error;
  }
};

// Update participant status
export const updateParticipantStatus = async (updateData: {
  meetingId: string;
  userId: string;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
}) => {
  try {
    const response = await axios.put(
      `${API_URL}/meetings/participant/status`,
      updateData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating participant status:", error);
    throw error;
  }
};

// Send a message in the meeting
export const sendMessage = async (messageData: {
  meetingId: string;
  senderId: string;
  message: string;
  isPrivate?: boolean;
  receiverId?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/meetings/message`,
      messageData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get meeting messages
export const getMeetingMessages = async (meetingId: string, userId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/meetings/${meetingId}/messages?userId=${userId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting meeting messages:", error);
    throw error;
  }
};

// Get meeting details
export const getMeetingDetails = async (meetingId: string) => {
  try {
    const response = await axios.get(`${API_URL}/meetings/${meetingId}`, {
      headers: getAuthHeader(),
    });
    return response;
  } catch (error) {
    console.error("Error getting meeting details:", error);
    throw error;
  }
};
