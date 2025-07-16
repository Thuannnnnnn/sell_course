// Message type
export interface Message {
    id?: string;
    messageText: string;
    sender: User;
    timestamp: string;
    sessionId: string;
  }
  
  // ChatSession type
  export interface ChatSession {
    id: string;
    user: User;
    startTime: string;
    endTime?: string;
    isActive: boolean;
  }
  
  // User type
  export interface User {
    user_id: string;
    username?: string;
  } 