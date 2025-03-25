import axios, { AxiosResponse } from "axios";

export interface StartChatResponse {
  sessionId: string;
}

export const StartChat = async (
  userId: string
): Promise<StartChatResponse | undefined> => {
  try {
    const response: AxiosResponse<StartChatResponse> = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`,
      {
        userId: userId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("chat error", error);
    return undefined;
  }
};
