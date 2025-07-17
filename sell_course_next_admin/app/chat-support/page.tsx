"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { getChatActiveSessions } from "../api/chat/active-sessions/active-session";
import { GetSessionChatHistory } from "app/api/chat/chat";
import { DeleteOldSessionsOfUser } from "app/api/chat/chat";

// 1. Định nghĩa lại các type cho đồng bộ với phía user
export interface UserProfile {
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
  sender?: UserProfile;
  sessionId?: string;
}

export interface ChatSession {
  id: string;
  startTime: string;
  isActive: boolean;
  endTime?: string | null;
  user: UserProfile;
  messages: Message[];
}

const SOCKET_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// 2. Sửa lại normalizeMessage cho đúng type mới
const normalizeMessage = (msg: {
  id: string;
  messageText: string;
  timestamp: string;
  sender?: UserProfile | string;
  sessionId?: string;
}): Message => {
  if (msg.sender && typeof msg.sender === 'object') {
    return msg as Message;
  }
  // Nếu sender là string (user_id), chỉ gán vào user_id
  if (typeof msg.sender === 'string') {
    return {
      ...msg,
      sender: { user_id: msg.sender } as UserProfile,
    };
  }
  // Nếu không có sender, chỉ lấy các trường cơ bản
  return {
    id: msg.id,
    messageText: msg.messageText,
    timestamp: msg.timestamp,
  };
};

function filterLatestSessionsByUser(sessions: ChatSession[]): ChatSession[] {
  const map = new Map<string, ChatSession>();
  for (const session of sessions) {
    const userId = session.user?.user_id;
    if (!userId) continue;
    if (!map.has(userId) || new Date(session.startTime) > new Date(map.get(userId)!.startTime)) {
      map.set(userId, session);
    }
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export default function SupportPage() {
  const { data: session, status } = useSession();
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch active sessions (no changes)
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    const fetchActiveSessions = async () => {
      try {
        const data = await getChatActiveSessions();
        // Lọc session: chỉ giữ session chưa kết thúc
        const filtered = data.filter(
          (s: ChatSession) => s.isActive || !s.endTime
        );
        setActiveSessions(filtered);
      } catch (err) {
        console.error("Error fetching active sessions:", err);
        // setError("Failed to load support sessions"); // removed unused
      } finally {
        // setLoading(false); // removed unused
      }
    };
    fetchActiveSessions();
  }, [session?.user?.id, status]);

  // Connect to socket and manage chat state
  useEffect(() => {
    if (!selectedSessionId || !session?.user?.id || !session?.accessToken) return;

    setMessages([]);
    // setError(null); // removed unused

    const fetchChatHistory = async () => {
      if (typeof selectedSessionId !== 'string' || typeof session?.accessToken !== 'string') return;
      try {
        const history = await GetSessionChatHistory(selectedSessionId, session.accessToken);
        const rawMessages = history?.messages || [];
        const normalizedMessages = rawMessages.map(normalizeMessage);
        setMessages(normalizedMessages);
      } catch (err) {
        console.error("Error fetching chat history:", err);
        // setError("Failed to load chat history"); // removed unused
      }
    };
    fetchChatHistory();

    const socket = io(SOCKET_SERVER, {
      query: { sessionId: selectedSessionId },
      transports: ["websocket"],
      auth: { token: session.accessToken, userId: session.user.id },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket for session:", selectedSessionId);
      // BẮT BUỘC: join room
      socket.emit("join", { sessionId: selectedSessionId });
    });
    socket.on("message", (newMessage: { id: string; messageText: string; timestamp: string; sender?: string | UserProfile; sessionId?: string }) => {
      const normalizedNewMessage = normalizeMessage(newMessage);
      // Debug log chi tiết như bên user
      console.log("[ADMIN] Received raw message:", newMessage);
      console.log("[ADMIN] Normalized message:", normalizedNewMessage);
      if (normalizedNewMessage) {
        console.log("[ADMIN] Message id:", normalizedNewMessage.id);
        console.log("[ADMIN] Message sender:", normalizedNewMessage.sender);
        console.log("[ADMIN] Message sessionId:", normalizedNewMessage.sender?.user_id);
        console.log("[ADMIN] Message text:", normalizedNewMessage.messageText);
        console.log("[ADMIN] Message timestamp:", normalizedNewMessage.timestamp);
      }
      setMessages((prev) => {
        // Nếu đã có message với id này, bỏ qua
        if (prev.find((m) => m.id === normalizedNewMessage.id)) return prev;

        // Nếu có message optimistic (id là tempId) với cùng nội dung, sender, timestamp, thì replace
        const optimisticIdx = prev.findIndex(
          (m) =>
            m.sender?.user_id === normalizedNewMessage.sender?.user_id &&
            m.messageText === normalizedNewMessage.messageText &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(normalizedNewMessage.timestamp).getTime()) < 2000 // cho phép lệch 2s
        );
        if (optimisticIdx !== -1) {
          const newMessages = [...prev];
          newMessages[optimisticIdx] = normalizedNewMessage;
          return newMessages;
        }
        return [...prev, normalizedNewMessage];
      });
    });

    socket.on("newSession", async (newSession) => {
      console.log("[SupportPage] Received newSession:", newSession.id);
      setActiveSessions((prev) => filterLatestSessionsByUser([newSession, ...prev]));
      // XÓA SESSION CŨ của user này, chỉ giữ lại session mới nhất
      if (newSession.user?.user_id && newSession.id && session?.accessToken) {
        await DeleteOldSessionsOfUser(newSession.user.user_id, newSession.id, session.accessToken);
      }
    });

    socket.on("sessionEnded", async (endedSessionId: string) => {
      setActiveSessions((prev) => {
        const updatedSessions = prev.filter(s => s.id !== endedSessionId);
        // Xóa session đã kết thúc khỏi database
        // deleteChatSession(endedSessionId); // This line was removed from the original file
        return updatedSessions;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedSessionId, session?.user?.id, session?.accessToken]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Khi gửi message, chỉ gửi sessionId, messageText (không gửi object sender)
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !socketRef.current || !selectedSessionId || !session?.user?.id) return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const messageData = {
      sessionId: selectedSessionId,
      message: input.trim(), // <-- must be 'message' for backend
      sender: session.user.id,
      timestamp: now,
      id: tempId,
    };

    socketRef.current.emit('sendMessage', messageData);
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sessionId: selectedSessionId,
        sender: {
          user_id: session.user.id,
          email: session.user.email || '',
          username: session.user.name || '',
          password: '',
          avatarImg: session.user.avatarImg || null,
          gender: session.user.gender || null,
          birthDay: session.user.birthDay || null,
          phoneNumber: session.user.phoneNumber || null,
          role: session.user.role || '',
          isOAuth: false,
          createdAt: '',
          updatedAt: '',
          isBan: false,
        },
        messageText: input.trim(),
        timestamp: now,
      },
    ]);
    setInput('');
  };

  const selectedSession = activeSessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Support</h1>
              <p className="text-gray-600">Manage and respond to customer inquiries</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full px-4 py-2 shadow-sm border">
                <span className="text-sm font-medium text-gray-700">
                  Active Sessions: {activeSessions.length}
                </span>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Support Sessions
                </h2>
                <p className="text-blue-100 text-sm mt-1">Click to join and help customers</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 font-medium">No active sessions</p>
                    <p className="text-gray-400 text-sm mt-1">Waiting for customers to reach out</p>
                  </div>
                ) : (
                  activeSessions.map((chatSession) => (
                    <div
                      key={chatSession.id}
                      className={`relative group transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                        selectedSessionId === chatSession.id 
                          ? "ring-2 ring-blue-500 ring-opacity-50" 
                          : ""
                      }`}
                      onClick={() => {
                        console.log("[SupportPage] Admin selecting sessionId:", chatSession.id);
                        setSelectedSessionId(chatSession.id);
                      }}
                    >
                      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedSessionId === chatSession.id
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }`}>
                        {/* Status indicator */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700">Active</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(chatSession.startTime).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* User info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {chatSession.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {chatSession.user?.username || 'Anonymous User'}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {chatSession.user?.user_id?.slice(-8) || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {/* Session info */}
                        <div className="text-xs text-gray-500 mb-3">
                          Started: {new Date(chatSession.startTime).toLocaleDateString()} at {new Date(chatSession.startTime).toLocaleTimeString()}
                        </div>

                        {/* Action button */}
                        <button
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                            selectedSessionId === chatSession.id
                              ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                              : "bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {selectedSessionId === chatSession.id ? "Supporting" : "Join Support"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col">
              {selectedSession ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {selectedSession.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            {selectedSession.user?.username || 'Anonymous User'}
                          </h2>
                          <p className="text-indigo-100 text-sm">
                            User ID: {selectedSession.user?.user_id || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50" style={{ maxHeight: "calc(100vh - 350px)" }}>
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No messages yet</p>
                        <p className="text-gray-400 text-sm mt-1">Start the conversation with your customer</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const senderId = msg.sender?.user_id || '';
                          const isCurrentUser = senderId === session?.user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                                <div className={`flex items-end space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                    isCurrentUser 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-gray-600 text-white'
                                  }`}>
                                    {isCurrentUser ? 'A' : (msg.sender?.username?.charAt(0)?.toUpperCase() || 'U')}
                                  </div>
                                  <div
                                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                                      isCurrentUser 
                                        ? 'bg-blue-600 text-white rounded-br-sm' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                    }`}
                                  >
                                    <div className={`text-xs mb-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                      {isCurrentUser ? 'You' : msg.sender?.username || `User ${senderId.slice(-8)}`}
                                    </div>
                                    <div className="text-sm leading-relaxed">{msg.messageText}</div>
                                    <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                      {new Date(msg.timestamp).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl">
                    <form className="flex items-center space-x-4" onSubmit={handleSendMessage}>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Type your message..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={!selectedSessionId}
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!input.trim() || !selectedSessionId}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a session to start</h3>
                    <p className="text-gray-500">Choose a customer session from the sidebar to begin providing support</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

