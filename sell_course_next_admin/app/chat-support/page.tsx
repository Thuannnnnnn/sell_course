"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";


interface Message {
  id: string;
  sessionId: string;
  messageText: string;
  timestamp: string;
  senderId: string;
}

interface ChatSession {
  id: string;
  startTime: string;
  isActive: boolean;
  endTime?: string | null;
  user: {
    user_id: string;
    username?: string;
  };
}

const SOCKET_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function SupportPage() {
  const { data: session, status } = useSession();
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedSessionIdRef = useRef<string | null>(null);
  const PAGE_SIZE = 3;
  const [page, setPage] = useState(1);

  // Main socket connection for sessions and chat
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    
    const socket = io(SOCKET_SERVER, {
      transports: ["websocket"],
      auth: { token: session?.accessToken, userId: session?.user?.id },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("getAllSessions")
    });

    socket.on("disconnect", () => {
      // Handle disconnect
    });

    socket.on("error", () => {
      // Handle error
    });

    socket.on("sessionsList", (sessions: ChatSession[]) => {
      setActiveSessions(sessions || []);
    });

    socket.on('newSession', (newSession: ChatSession) => {
      setActiveSessions(prev => {
        const exists = prev.find(s => s.id === newSession.id);
        if (exists) return prev;
        return [...prev, newSession];
      });
    });

    socket.on('sessionUpdated', (updatedSession: ChatSession) => {
      setActiveSessions(prev => 
        prev.map(s => s.id === updatedSession.id ? updatedSession : s)
      );
    });

    socket.on('sessionEnded', (sessionId: string) => {
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      if (selectedSessionIdRef.current === sessionId) {
        setSelectedSessionId(null);
        setMessages([]);
      }
    });

    socket.on("message", (msg: Message) => {
      if (msg.sessionId === selectedSessionIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          // Handle optimistic updates
          const optimisticIdx = prev.findIndex(
            (m) =>
              m.id.startsWith('temp-') &&
              m.senderId === msg.senderId &&
              m.messageText === msg.messageText &&
              Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 2000
          );
          if (optimisticIdx !== -1) {
            const newMessages = [...prev];
            newMessages[optimisticIdx] = msg;
            return newMessages;
          }
          return [...prev, msg];
        });
      }
    });

    socket.on("history", (msgs: Message[]) => {
      setMessages(msgs || []);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [status, session?.user?.id, session?.accessToken]);

  // Handle session selection
  useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId;
    
    if (!selectedSessionId || !socketRef.current) {
      return;
    }
    setMessages([]);
    // Join the selected session and get history
    socketRef.current.emit("join", { sessionId: selectedSessionId });
    socketRef.current.emit("getHistory", selectedSessionId);
    
    return () => {
      // Leave the session when switching or unmounting
      if (socketRef.current && selectedSessionId) {
        socketRef.current.emit("leave", { sessionId: selectedSessionId });
      }
    };
  }, [selectedSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !socketRef.current || !selectedSessionId || !session?.user?.id) return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const messageData = {
      sessionId: selectedSessionId,
      message: input.trim(),
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
        senderId: session.user.id,
        messageText: input.trim(),
        timestamp: now,
      },
    ]);
    setInput('');
  };
  const selectedSession = activeSessions.find((s) => s.id === selectedSessionId);
  const renderSender = (msg: Message) => {
    if (msg.senderId === session?.user?.id) {
      return session?.user?.name || "Admin";
    }
    const customer = selectedSession?.user;
    if (customer && msg.senderId === customer.user_id) {
      return customer.username || `Guest ${customer.user_id?.slice(-4) || selectedSession?.id?.slice(-4)}`;
    }
    const senderSession = activeSessions.find(s => s.user.user_id === msg.senderId);
    if (senderSession?.user?.username) {
      return senderSession.user.username;
    }
    if (senderSession?.user?.user_id) {
      return `Guest ${senderSession.user.user_id.slice(-4)}`;
    }
    return `Guest ${msg.senderId?.slice(-4) || 'Unknown'}`;
  };

  const totalPages = Math.ceil(activeSessions.length / PAGE_SIZE);
  const paginatedSessions = activeSessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                {paginatedSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 font-medium">No active sessions</p>
                    <p className="text-gray-400 text-sm mt-1">Waiting for customers to reach out</p>
                  </div>
                ) : (
                  paginatedSessions.map((chatSession) => (
                    <div
                      key={chatSession.id}
                      className={`relative group transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                        selectedSessionId === chatSession.id 
                          ? "ring-2 ring-blue-500 ring-opacity-50" 
                          : ""
                      }`}
                      onClick={() => setSelectedSessionId(chatSession.id)}
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
                              {chatSession.user?.username?.charAt(0)?.toUpperCase() || 'G'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {chatSession.user?.username || `Guest ${chatSession.user?.user_id?.slice(-4) || chatSession.id.slice(-4)}`}
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

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    &lt;
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
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
                            {selectedSession.user?.username?.charAt(0)?.toUpperCase() || 'G'}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            {selectedSession.user?.username || `Guest ${selectedSession.user?.user_id?.slice(-4) || selectedSession.id.slice(-4)}`}
                          </h2>
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
                        {messages.map((msg, idx) => {
                          const isCurrentUser = msg.senderId === session?.user?.id;
                          return (
                            <div
                              key={msg.id || idx}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                                <div className={`flex items-end space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                    isCurrentUser 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-gray-600 text-white'
                                  }`}>
                                    {isCurrentUser ? (session?.user?.name?.charAt(0)?.toUpperCase() || 'A') : (selectedSession.user?.username?.charAt(0)?.toUpperCase() || 'G')}
                                  </div>
                                  <div
                                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                                      isCurrentUser 
                                        ? 'bg-blue-600 text-white rounded-br-sm' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                    }`}
                                  >
                                    <div className={`text-xs mb-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                      {renderSender(msg)}
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
