import axios, { AxiosError } from "axios";
import { User } from "../../type/user/User";
import { HostedMeeting, JoinedMeeting } from "../../type/meeting/Meeting";

interface ApiError {
  status: number;
  error: string;
  message: string;
}

interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeader = () => {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage");
    }
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  role: "host" | "participant";
}

export const createMeeting = async (meetingData: {
  title: string;
  description?: string;
  isScheduled?: boolean;
  scheduledTime?: string;
  isRecorded?: boolean;
}): Promise<ApiResponse<{ id: string; meetingCode: string }>> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    console.log("Creating meeting with data:", meetingData);
    console.log("Token:", token);

    const response = await axios.post(
      `${API_URL}/meetings/create`,
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response from BE:", response.data);
    return { data: response.data.data };
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      throw new Error(apiError?.message || "Failed to create meeting");
    }
    throw error;
  }
};

export const joinMeeting = async (joinData: {
  meetingCode: string;
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

export const leaveMeeting = async (meetingId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/meetings/delete`, {
      headers: getAuthHeader(),
      data: { meetingId },
    });
    return response.data;
  } catch (error) {
    console.error("Error leaving meeting:", error);
    throw error;
  }
};

export const getHostedMeetings = async () => {
  try {
    const response = await axios.get(`${API_URL}/meetings/hosted`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error getting hosted meetings:", error);
    throw error;
  }
};

export const getJoinedMeetings = async () => {
  try {
    const response = await axios.get(`${API_URL}/meetings/joined`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error getting joined meetings:", error);
    throw error;
  }
};

export const getMeetingParticipants = async (meetingId: string) => {
  try {
    const response = await axios.get(`${API_URL}/meetings/participants`, {
      headers: getAuthHeader(),
      params: { meetingId },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error getting meeting participants:", error);
    throw error;
  }
};

export const getMeetingById = async (meetingId: string) => {
  try {
    try {
      const participants = await getMeetingParticipants(meetingId);

      const hostedMeetings = await getHostedMeetings();
      const joinedMeetings = await getJoinedMeetings();

      const hostedMeeting = hostedMeetings.find(
        (m: HostedMeeting) => m.id === meetingId
      );
      const joinedMeeting = joinedMeetings.find(
        (m: JoinedMeeting) => m.id === meetingId
      );

      if (hostedMeeting) {
        return {
          ...hostedMeeting,
          isHost: true,
          participants: participants,
        };
      } else if (joinedMeeting) {
        return {
          ...joinedMeeting,
          isHost: joinedMeeting.isHost,
          participants: participants,
        };
      } else {
        if (participants && participants.length > 0) {
          const participant = participants[0];
          return {
            id: meetingId,
            title: "Meeting",
            meetingCode: "",
            startTime: participant.joinTime || new Date().toISOString(),
            isActive: true,
            hostId: "",
            isHost: false,
            participants: participants,
          };
        }
      }

      throw new Error("Meeting not found");
    } catch {
      throw new Error("Meeting not found or you don't have access");
    }
  } catch {
    console.error("Error getting meeting details");
    throw new Error("Failed to get meeting details");
  }
};

export const updateParticipantStatus = async (updateData: {
  meetingId: string;
  hasCamera: boolean;
  hasMicrophone: boolean;
  isScreenSharing: boolean;
}) => {
  try {
    const response = await axios.put(
      `${API_URL}/meetings/participant/status`,
      updateData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating participant status:", error);
    throw error;
  }
};
