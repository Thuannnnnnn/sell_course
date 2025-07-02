import axios from "axios";

export const getChatSuggestions = async (docUrl: string): Promise<string[]> => {
  const API_ENDPOINTSuggest =
    process.env.NEXT_PUBLIC_N8N_URL + "/suggest-question";

  try {
    const response = await axios.post<string[]>(API_ENDPOINTSuggest, {
      url: docUrl,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chat suggestions:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  docUrl: string,
  question: string
): Promise<string> => {
  const API_ENDPOINTChat = process.env.NEXT_PUBLIC_N8N_URL + "/chat";

  try {
    const response = await axios.post<string>(API_ENDPOINTChat, {
      url: docUrl,
      question: question,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
};
