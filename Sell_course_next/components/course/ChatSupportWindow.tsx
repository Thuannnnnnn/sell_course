'use client';
import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { getUserById } from '../../app/api/profile/profile';
import { StartChat } from '../../app/api/chat/chat';
import { Message } from '../../app/types/chat';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for unique message IDs

const SOCKET_SERVER = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Fallback for development

const ChatWindow: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch user ID and start chat session
  useEffect(() => {
    const fetchUserIdAndSession = async () => {
      if (!session?.accessToken) return;
      setIsLoading(true);
      try {
        const user = await getUserById(session.accessToken);
        if (!user?.user_id) throw new Error('Failed to fetch user ID');
        setCurrentUserId(user.user_id);

        const chatSession = await StartChat(user.user_id, session.accessToken);
        if (!chatSession?.sessionId) throw new Error('Failed to create chat session');
        setChatSessionId(chatSession.sessionId);
      } catch (err: unknown) {
        console.error('Error fetching user ID or creating session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchUserIdAndSession();
    }
  }, [session]);

  // Connect to socket
  useEffect(() => {
    if (!chatSessionId || !currentUserId || !session?.accessToken) return;

    const socket = io(SOCKET_SERVER, {
      query: { sessionId: chatSessionId, userId: currentUserId },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('message', (msg: Message) => {
      console.log('Received message:', msg);
      if (!msg.sessionId && chatSessionId) msg.sessionId = chatSessionId;
      if (msg.sessionId === chatSessionId) {
        setMessages((prev) => {
          // Nếu đã có message với id này, bỏ qua
          if (prev.some((m) => m.id === msg.id)) return prev;

          // Nếu có message optimistic (id là tempId) với cùng nội dung, sender, timestamp, thì replace
          const optimisticIdx = prev.findIndex(
            (m) =>
              !m.id?.startsWith('72144c63') && // id không phải id backend (tùy cách bạn đặt tempId)
              m.sender?.user_id === msg.sender?.user_id &&
              m.messageText === msg.messageText &&
              Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 2000 // cho phép lệch 2s
          );
          if (optimisticIdx !== -1) {
            // Replace optimistic message bằng message từ backend
            const newMessages = [...prev];
            newMessages[optimisticIdx] = msg;
            return newMessages;
          }

          // Nếu không trùng, thêm mới
          return [...prev, msg];
        });
      }
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    socket.emit('join', { sessionId: chatSessionId, userId: currentUserId });

    return () => {
      socket.disconnect();
    };
  }, [chatSessionId, currentUserId, session?.accessToken]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageText = input.trim();

    if (!messageText || !socketRef.current || !chatSessionId || !currentUserId) return;

    const tempId = uuidv4(); // Use UUID for unique temporary ID

    const messagePayload = {
      sessionId: chatSessionId,
      message: messageText,
      sender: currentUserId,
      timestamp: new Date().toISOString(),
      id: tempId,
    };

    const optimisticMessage: Message = {
      id: tempId,
      sessionId: chatSessionId,
      messageText: messageText,
      timestamp: messagePayload.timestamp,
      sender: {
        user_id: currentUserId,
        email: session?.user?.email || '',
        username: session?.user?.name || '',
        password: '',
        avatarImg: session?.user?.avatarImg || null,
        gender: session?.user?.gender || null,
        birthDay: session?.user?.birthDay || null,
        phoneNumber: session?.user?.phoneNumber || null,
        role: session?.user?.role || '',
        isOAuth: false,
        createdAt: '',
        updatedAt: '',
        isBan: false,
      },
    };

    console.log('Sending message payload:', messagePayload);
    socketRef.current.emit('sendMessage', messagePayload);
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
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
            <h3 className="font-semibold text-sm">Hỗ trợ trực tuyến</h3>
            <p className="text-xs opacity-90">
              {isLoading ? 'Đang kết nối...' : isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Thu nhỏ"
        >
          <span className="font-bold text-lg">−</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {isLoading && <div className="text-gray-400 text-center mt-10">Đang tải...</div>}
        {!isLoading && messages.length === 0 && (
          <div className="text-gray-400 text-center mt-10">Chưa có tin nhắn nào. Hãy gửi lời chào!</div>
        )}
        {messages.map((msg, idx) => {
          const senderId = msg.sender?.user_id || '';
          const isCurrentUser = senderId === currentUserId;
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
                  {isCurrentUser ? 'Bạn' : msg.sender?.username || 'Hỗ trợ'}
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
            placeholder="Nhập tin nhắn..."
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