import axios, { AxiosResponse } from "axios";

export interface StartChatResponse {
  sessionId: string;
}

export interface ChatSessionResponse {
  sessionId: string;
  messages: {
    id: string;
    sessionId: string;
    sender: string;
    messageText: string;
    timestamp: string;
  }[];
  isNewSession: boolean;
}

export interface ChatHistoryResponse {
  session: {
    id: string;
    userId: string;
    startTime: string;
    isActive: boolean;
    endTime?: string;
  };
  messages: {
    id: string;
    sessionId: string;
    sender: string;
    messageText: string;
    timestamp: string;
  }[];
}

// const notifyAdminNewChat = async (userId: string, token: string) => {
//   try {
//     await axios.post(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/admin/notify/create`,
//       {
//         title: "New Ticket Support",
//         message: `New Ticket Support`,
//         type: "ADMIN",
//         isGlobal: true,
//         courseId: "",
//         userId: userId,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Failed to notify admin", error);
//   }
// };

export const StartOrGetChatSession = async (
  userId: string,
  sessionId: string | null,
  token: string
): Promise<ChatSessionResponse | undefined> => {
  try {
    const response: AxiosResponse<ChatSessionResponse> = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/chats/session`,
      {
        userId: userId,
        sessionId: sessionId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("chat session error", error);
    return undefined;
  }
};

export const StartChat = async (
  userId: string,
  token: string
): Promise<StartChatResponse | undefined> => {
  try {
    const response: AxiosResponse<StartChatResponse> = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/chats`,
      {
        userId: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("chat error", error);
    return undefined;
  }
};

export const GetChatHistory = async (
  userId: string,
  token: string
): Promise<ChatHistoryResponse[] | undefined> => {
  try {
    const response: AxiosResponse<ChatHistoryResponse[]> = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/chats/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          userId: userId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch chat history", error);
    return undefined;
  }
};