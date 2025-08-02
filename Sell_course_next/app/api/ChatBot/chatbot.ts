import axios from "axios";

// Interface for individual question
export interface Question {
  question_id: number;
  question_type: "Factual" | "Inferential" | "Analytical/Evaluative";
  question_text: string;
}

// Interface for the API response
export interface ChatSuggestionsResponse {
  generated_questions: Question[];
}

// Interface for the complete API response structure (if needed)
export interface ApiResponse {
  output: ChatSuggestionsResponse;
}

// Interface for chat message response
export interface ChatMessageResponse {
  answer: string;
}

// Interface for the complete chat API response structure
export interface ChatApiResponse {
  output: ChatMessageResponse;
}

export const getChatSuggestions = async (docUrl: string): Promise<string[]> => {
  const API_ENDPOINTSuggest =
    process.env.NEXT_PUBLIC_N8N_URL + "/suggest-question";

  try {
    const response = await axios.post<ApiResponse[]>(API_ENDPOINTSuggest, {
      urls: docUrl,
    });
    
    // Extract question texts from the response
    const questions = response.data[0]?.output?.generated_questions || [];
    return questions.map(q => q.question_text);
  } catch (error) {
    console.error("Failed to fetch chat suggestions:", error);
    throw error;
  }
};

// Enhanced function that returns full question objects
export const getChatSuggestionsDetailed = async (docUrl: string): Promise<Question[]> => {
  const API_ENDPOINTSuggest =
    process.env.NEXT_PUBLIC_N8N_URL + "/suggest-question";

  try {
    const response = await axios.post<ApiResponse[]>(API_ENDPOINTSuggest, {
      urls: docUrl,
    });
    
    // Return full question objects
    return response.data[0]?.output?.generated_questions || [];
  } catch (error) {
    console.error("Failed to fetch detailed chat suggestions:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  docUrl: string,
  question: string
): Promise<string> => {
  const API_ENDPOINTChat = process.env.NEXT_PUBLIC_N8N_URL + "/chat";

  try {
    const response = await axios.post<ChatApiResponse[]>(API_ENDPOINTChat, {
      url: docUrl,
      question: question,
    });
    
    // Extract answer from the response structure
    return response.data[0]?.output?.answer || "";
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
};

// Cache for suggestions to avoid repeated API calls
const suggestionsCache = new Map<string, {
  data: string[];
  timestamp: number;
  expiry: number;
}>();

const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

// Preload suggestions function for better performance
export const preloadChatSuggestions = async (docUrl: string): Promise<void> => {
  const cacheKey = docUrl;
  const cached = suggestionsCache.get(cacheKey);
  
  // Check if we have valid cached data
  if (cached && Date.now() < cached.expiry) {
    return; // Already cached and not expired
  }

  try {
    const suggestions = await getChatSuggestions(docUrl);
    suggestionsCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_EXPIRY_TIME
    });
  } catch (error) {
    console.error("Failed to preload chat suggestions:", error);
  }
};

// Enhanced getChatSuggestions with caching
export const getChatSuggestionsWithCache = async (docUrl: string): Promise<string[]> => {
  const cacheKey = docUrl;
  const cached = suggestionsCache.get(cacheKey);
  
  // Return cached data if available and not expired
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  // Fetch fresh data
  const suggestions = await getChatSuggestions(docUrl);
  
  // Update cache
  suggestionsCache.set(cacheKey, {
    data: suggestions,
    timestamp: Date.now(),
    expiry: Date.now() + CACHE_EXPIRY_TIME
  });

  return suggestions;
};
