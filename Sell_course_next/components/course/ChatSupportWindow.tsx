'use client';
import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { getUserById } from '../../app/api/profile/profile'

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
// Thời gian tồn tại session: 2 giờ (2 * 60 * 60 * 1000 ms)
const SESSION_DURATION = 2 * 60 * 60 * 1000

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

  // Fetch user ID only (don't create session yet)
  useEffect(() => {
    const initUser = async () => {
      if (!session?.accessToken || sessionFetched.current) return;
      sessionFetched.current = true; // Mark fetched
      setIsLoading(true);
      try {
        const user = await getUserById(session.accessToken);
        if (!user?.user_id) return;
        setCurrentUserId(user.user_id);

        // Restore existing sessionId from localStorage if not expired
        if (typeof window !== 'undefined') {
          const localId = localStorage.getItem(SESSION_KEY);
          const expireTime = localStorage.getItem(SESSION_EXPIRE_KEY);
          const now = Date.now();
          if (localId && expireTime && now < parseInt(expireTime)) {
            setChatSessionId(localId);
          } else {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_EXPIRE_KEY);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        sessionFetched.current = false; // Reset on error
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, [session?.accessToken]);

  // Debug effect để theo dõi chatSessionId
  useEffect(() => {
  }, [chatSessionId, currentUserId, session?.accessToken]);

  // Connect to socket (can connect even without sessionId)
  useEffect(() => {
    if (!currentUserId || !session?.accessToken) {
      setIsConnected(false);
      return;
    }

    // Clean up existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_SERVER, {
      query: chatSessionId ? { sessionId: chatSessionId, userId: currentUserId } : { userId: currentUserId },
      transports: ['websocket'],
      auth: { token: session.accessToken, userId: currentUserId },
      forceNew: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (chatSessionId) {
        socket.emit('join', { sessionId: chatSessionId, userId: currentUserId });
        socket.emit('getHistory', chatSessionId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Dedup state to prevent double-append (client optimistic + server echo)
    let lastSentId: string | null = null;
    socket.on('messageSent', ({ messageId }) => {
      lastSentId = messageId;
    });

    // Listen new messages, with strong de-dup logic
    socket.on('message', (msg: Message) => {
      const effectiveSessionId = chatSessionId || msg.sessionId;
      if (!effectiveSessionId) return;
      if (!msg.sessionId) msg.sessionId = effectiveSessionId;
      if (msg.sessionId !== effectiveSessionId) return;

      setMessages((prev) => {
        // 1) exact id already exists
        if (prev.some((m) => m.id === msg.id)) return prev;

        // 2) if this is the echo of our last optimistic message, replace temp with server id
        const optimisticIdx = prev.findIndex(
          (m) =>
            m.id.startsWith('temp-') &&
            m.senderId === msg.senderId &&
            m.messageText === msg.messageText &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 3000
        );
        if (optimisticIdx !== -1) {
          const newMessages = [...prev];
          newMessages[optimisticIdx] = msg;
          return newMessages;
        }

        // 3) also guard if matches lastSentId
        if (lastSentId && msg.id === lastSentId) return prev;

        return [...prev, msg];
      });
    });

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

    if (!messageText || !currentUserId || !session?.accessToken) return;

    // If no session exists, create a new one on-the-fly with UUID and persist locally
    let effectiveSessionId = chatSessionId;
    if (!effectiveSessionId) {
      effectiveSessionId = uuidv4();
      setChatSessionId(effectiveSessionId);
      if (typeof window !== 'undefined') {
        const now = Date.now();
        localStorage.setItem(SESSION_KEY, effectiveSessionId);
        localStorage.setItem(SESSION_EXPIRE_KEY, (now + SESSION_DURATION).toString());
      }
      // Join room immediately so that echo comes back to this client
      if (socketRef.current) {
        socketRef.current.emit('join', { sessionId: effectiveSessionId, userId: currentUserId });
      }
    }

    // Send message via socket with optimistic update
    sendMessageToSocket(effectiveSessionId, messageText);
  };

  // Helper function to send message via socket
  const sendMessageToSocket = (sessionId: string, messageText: string) => {
    if (!socketRef.current || !currentUserId) return;

    // Use a deterministic temp key to avoid duplicates when server echoes back quickly
    const tempId = 'temp-' + uuidv4();

    const messagePayload = {
      sessionId: sessionId,
      message: messageText,
      sender: currentUserId,
      timestamp: new Date().toISOString(),
      id: tempId,
    };

    const optimisticMessage: Message = {
      id: tempId,
      sessionId: sessionId,
      messageText: messageText,
      timestamp: messagePayload.timestamp,
      senderId: currentUserId,
    };

    // Append optimistically only if not already in list (rare race protection)
    setMessages((prev) => {
      if (prev.some((m) => m.id === tempId)) return prev;
      return [...prev, optimisticMessage];
    });

    socketRef.current.emit('sendMessage', messagePayload);
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
               !chatSessionId ? 'Click to start chat' :
               isConnected ? 'Online' : 
               'Reconnecting...'}
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
          <div className="text-gray-400 text-center mt-10">
            {chatSessionId ? "No messages yet. Say hello!" : "Send your first message to start a support session!"}
          </div>
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
            placeholder={chatSessionId ? "Type your message..." : "Type your first message to start chat..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            <span className="font-bold text-lg">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;