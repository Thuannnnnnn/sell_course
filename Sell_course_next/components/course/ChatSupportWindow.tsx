'use client';
import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { getUserById } from '../../app/api/profile/profile'
import { StartChat } from '../../app/api/chat/chat'
import { v4 as uuidv4 } from 'uuid'

const SOCKET_SERVER = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Message {
  id: string
  sessionId: string
  messageText: string
  timestamp: string
  senderId: string
}

const SESSION_KEY = 'chatSessionId'
const SESSION_EXPIRE_KEY = 'chatSessionExpire'

const ChatWindow: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [chatSessionId, setChatSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sessionFetched = useRef(false); // Để tránh fetch lại session

  // Fetch user ID and start chat session
  useEffect(() => {
    const fetchUserIdAndSession = async () => {
      if (!session?.accessToken || sessionFetched.current) return;
      sessionFetched.current = true; // Đánh dấu đã fetch
      setIsLoading(true);
      try {
        const user = await getUserById(session.accessToken);
        if (!user?.user_id) return;
        setCurrentUserId(user.user_id);

        // Kiểm tra localStorage có sessionId và còn hạn không
        let localSessionId = null;
        let localExpire = null;
        if (typeof window !== 'undefined') {
          localSessionId = localStorage.getItem(SESSION_KEY);
          localExpire = localStorage.getItem(SESSION_EXPIRE_KEY);
        }
        const now = Date.now();
        if (
          localSessionId &&
          localExpire &&
          Number(localExpire) > now
        ) {
          setChatSessionId(localSessionId);
        } else {
          // Tạo phiên mới
          const chatSession = await StartChat(user.user_id, session.accessToken);
          if (!chatSession?.sessionId) {
            return;
          }
          setChatSessionId(chatSession.sessionId);
          // Lưu vào localStorage, expire sau 24h
          if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, chatSession.sessionId);
            localStorage.setItem(SESSION_EXPIRE_KEY, (now + 24 * 60 * 60 * 1000).toString());
          }
        }
      } catch {
        sessionFetched.current = false; // Reset nếu có lỗi
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchUserIdAndSession();
    }
  }, [session?.accessToken]);

  // Debug effect để theo dõi chatSessionId
  useEffect(() => {
  }, [chatSessionId, currentUserId, session?.accessToken]);

  // Connect to socket
  useEffect(() => {
    if (!chatSessionId || !currentUserId || !session?.accessToken) {
      setIsConnected(false);
      return;
    }

    // Clean up existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_SERVER, {
      query: { sessionId: chatSessionId, userId: currentUserId },
      transports: ['websocket'],
      auth: { token: session.accessToken, userId: currentUserId },
      forceNew: true, // Force new connection
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', { sessionId: chatSessionId, userId: currentUserId });
      socket.emit('getHistory', chatSessionId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('message', (msg: Message) => {
      // msg: { id, sessionId, senderId, messageText, timestamp }
      if (!msg.sessionId && chatSessionId) msg.sessionId = chatSessionId;
      if (msg.sessionId === chatSessionId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
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

    // Lắng nghe lịch sử chat trả về từ BE
    socket.on('history', (msgs: Message[]) => {
      setMessages(msgs || []);
    });

    socket.on('error', () => {
      setIsConnected(false);
    });

    // Add retry logic on connection failure
    const connectTimeout = setTimeout(() => {
      if (!socket.connected) {
        socket.connect();
      }
    }, 5000);

    return () => {
      clearTimeout(connectTimeout);
      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
      }
      socketRef.current = null;
    };
  }, [chatSessionId, currentUserId, session?.accessToken]);

  // Ensure connection is established when component mounts
  useEffect(() => {
    if (chatSessionId && currentUserId && session?.accessToken && !isConnected) {
      const retryConnection = () => {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      };
      const retryInterval = setInterval(retryConnection, 2000);
      return () => {
        clearInterval(retryInterval);
      };
    }
  }, [chatSessionId, currentUserId, session?.accessToken, isConnected]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageText = input.trim();

    if (!messageText || !socketRef.current || !chatSessionId || !currentUserId) return;

    const tempId = 'temp-' + uuidv4();

    const messagePayload = {
      sessionId: chatSessionId,
      message: messageText,
      sender: currentUserId, // BE expects string userId
      timestamp: new Date().toISOString(),
      id: tempId,
    };

    const optimisticMessage: Message = {
      id: tempId,
      sessionId: chatSessionId,
      messageText: messageText,
      timestamp: messagePayload.timestamp,
      senderId: currentUserId,
    };


    socketRef.current.emit('sendMessage', messagePayload);
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          disabled={isLoading}
        >
          <span className="font-bold text-lg">💬</span>
          {isLoading && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>
    );
  }

  // Full chat window
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg">💬</span>
          <div>
            <h3 className="font-semibold text-sm">Online Support</h3>
            <p className="text-xs opacity-90">
              {isLoading ? 'Connecting...' : 
               isConnected ? 'Online' : 
               (chatSessionId && currentUserId ? 'Reconnecting...' : 'Offline')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Minimize"
        >
          <span className="font-bold text-lg">−</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {isLoading && <div className="text-gray-400 text-center mt-10">Loading...</div>}
        {!isLoading && messages.length === 0 && (
          <div className="text-gray-400 text-center mt-10">No messages yet. Say hello!</div>
        )}
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.senderId === currentUserId;
          return (
            <div key={msg.id || idx} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-lg px-3 py-2 max-w-[70%] shadow-sm ${
                  isCurrentUser ? 'bg-green-500 text-white' : 'bg-white border border-gray-200'
                }`}
              >
                <div
                  className={`text-xs mb-1 flex items-center gap-1 ${
                    isCurrentUser ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {isCurrentUser ? 'You' : `Supporter`}
                  <span className="ml-2">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="whitespace-pre-line break-words text-sm">{msg.messageText}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <span className="font-bold text-lg">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;