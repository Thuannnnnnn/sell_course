import axios from "axios";
import { User } from "../../type/user/User";
import { HostedMeeting, JoinedMeeting } from "../../type/meeting/Meeting";

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
  role: "host" | "participant"; // Thêm role
}

// Các hàm API không thay đổi, chỉ cần đảm bảo BE trả về role trong response
export const createMeeting = async (meetingData: {
  title: string;
  description?: string;
  isScheduled?: boolean;
  scheduledTime?: string;
  isRecorded?: boolean;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/meetings/create`,
      meetingData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};

// Các hàm khác giữ nguyên...

// Join a meeting
export const joinMeeting = async (joinData: {
  meetingCode: string;
  hasCamera?: boolean;
  hasMicrophone?: boolean;
}) => {
  try {
    const response = await axios.post(`${API_URL}/meetings/join`, joinData, {
      headers: getAuthHeader(),
    });
    return response.data; // { meetingId, meetingCode }
  } catch (error) {
    console.error("Error joining meeting:", error);
    throw error;
  }
};

// Leave a meeting (or delete for participant/host)
export const leaveMeeting = async (meetingId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/meetings/delete`, {
      headers: getAuthHeader(),
      data: { meetingId }, // Gửi meetingId trong body
    });
    return response.data; // { message }
  } catch (error) {
    console.error("Error leaving meeting:", error);
    throw error;
  }
};

// Get hosted meetings for the authenticated user
export const getHostedMeetings = async () => {
  try {
    const response = await axios.get(`${API_URL}/meetings/hosted`, {
      headers: getAuthHeader(),
    });
    return response.data.data; // Array of Meeting
  } catch (error) {
    console.error("Error getting hosted meetings:", error);
    throw error;
  }
};

// Get joined meetings for the authenticated user
export const getJoinedMeetings = async () => {
  try {
    const response = await axios.get(`${API_URL}/meetings/joined`, {
      headers: getAuthHeader(),
    });
    return response.data.data; // Array of Meeting
  } catch (error) {
    console.error("Error getting joined meetings:", error);
    throw error;
  }
};

// Get participants in a meeting
export const getMeetingParticipants = async (meetingId: string) => {
  try {
    const response = await axios.get(`${API_URL}/meetings/participants`, {
      headers: getAuthHeader(),
      params: { meetingId },
    });
    return response.data.data; // Array of MeetingParticipant
  } catch (error) {
    console.error("Error getting meeting participants:", error);
    throw error;
  }
};

// Get meeting details by ID
// Since there's no direct endpoint, we'll use the participants endpoint to get the meeting ID
// and then determine if the current user is the host
export const getMeetingById = async (meetingId: string) => {
  try {
    try {
      // First, try to get the participants to verify the meeting exists
      const participants = await getMeetingParticipants(meetingId);

      // Get both hosted and joined meetings
      const hostedMeetings = await getHostedMeetings();
      const joinedMeetings = await getJoinedMeetings();

      // Find the meeting in either hosted or joined meetings
      const hostedMeeting = hostedMeetings.find(
        (m: HostedMeeting) => m.id === meetingId
      );
      const joinedMeeting = joinedMeetings.find(
        (m: JoinedMeeting) => m.id === meetingId
      );

      // Combine the data
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
        // If we have participants but no meeting in hosted or joined lists,
        // create a basic meeting object with the available data
        if (participants && participants.length > 0) {
          const participant = participants[0];
          return {
            id: meetingId,
            title: "Meeting", // Default title
            meetingCode: "", // We don't have this information
            startTime: participant.joinTime || new Date().toISOString(),
            isActive: true,
            hostId: "", // We don't know who the host is
            isHost: false, // Assume not host if we can't find in hosted meetings
            participants: participants,
          };
        }
      }

      throw new Error("Meeting not found");
    } catch (error) {
      // If we can't get participants, the meeting might not exist or the user doesn't have access
      throw new Error("Meeting not found or you don't have access");
    }
  } catch (error) {
    console.error("Error getting meeting details:", error);
    throw error;
  }
};

// Update participant status (camera, microphone, screen sharing)
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
