import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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

export const codeMeetingService = {
  async createRoom(
    userId: string,
    username: string,
    token: string
  ): Promise<CodeMeetingRoom> {
    const response = await axios.post(
      `${API_URL}/code-meeting/rooms`,
      { userId, username },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async joinRoom(
    roomId: string,
    userId: string,
    username: string,
    token: string
  ): Promise<CodeMeetingRoom> {
    try {
      console.log("Joining room with API_URL:", API_URL);
      console.log("Full request URL:", `${API_URL}/code-meeting/rooms/join`);
      console.log("Request payload:", { roomId, userId, username });
      console.log("Token:", token);
      const response = await axios.post(
        `${API_URL}/code-meeting/rooms/join`,
        { roomId, userId, username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Join room response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Join room error:", error);
      throw error;
    }
  },

  async leaveRoom(
    roomId: string,
    token: string
  ): Promise<{ success: boolean }> {
    const response = await axios.post(
      `${API_URL}/code-meeting/rooms/leave`,
      { roomId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getRoom(
    roomId: string,
    token: string
  ): Promise<CodeMeetingRoom | null> {
    const response = await axios.get(
      `${API_URL}/code-meeting/rooms/${roomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getRoomParticipants(
    roomId: string,
    token: string
  ): Promise<CodeMeetingParticipant[]> {
    const response = await axios.get(
      `${API_URL}/code-meeting/rooms/${roomId}/participants`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
