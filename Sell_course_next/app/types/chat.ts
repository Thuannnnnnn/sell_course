// app/types/chat.ts

export interface User {
  user_id: string;
  email: string;
  username: string;
  password?: string | null;
  avatarImg?: string | null;
  gender?: string | null;
  birthDay?: string | null;
  phoneNumber?: string | null;
  role: string;
  isOAuth: boolean;
  createdAt: string;
  updatedAt: string;
  isBan: boolean;
}

export interface Sender {
  user_id: string;
  email: string;
  username: string;
  password?: string | null;
  avatarImg?: string | null;
  gender?: string | null;
  birthDay?: string | null;
  phoneNumber?: string | null;
  role: string;
  isOAuth: boolean;
  createdAt: string;
  updatedAt: string;
  isBan: boolean;
}

export interface Message {
  id: string;
  messageText: string;
  timestamp: string;
  sender?: Sender;
  sessionId?: string;
}

export interface ChatSession {
  id: string;
  startTime: string;
  isActive: boolean;
  endTime?: string;
  user: User;
  messages: Message[];
}

export interface ChatResponse {
  session: ChatSession;
  messages: Message[];
}