import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";

// Định nghĩa interface cho message
interface ChatMessage {
  sessionId: string;
  sender: string;
  messageText: string;
  timestamp: string;
}

// Định nghĩa interface cho dữ liệu gửi đi
interface SendMessageData {
  sessionId: string;
  message: string;
  sender: string;
}

// Định nghĩa interface cho kết quả trả về của hook
interface UseSocketResult {
  socket: Socket | null;
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
}

const useSocket = (sessionId: string | string[]): UseSocketResult => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { data: session } = useSession();
  // Khởi tạo và quản lý kết nối WebSocket
  useEffect(() => {
    const newSocket = io("http://localhost:8080", { autoConnect: true });
    setSocket(newSocket);

    // Xử lý sự kiện connect
    newSocket.on("connect", () => {
      newSocket.emit("join", { sessionId });
    });

    // Xử lý sự kiện nhận message
    newSocket.on("message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup khi component unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [sessionId]);

  // Hàm gửi tin nhắn
  const sendMessage = useCallback(
    (message: string) => {
      if (socket && message.trim() && session?.user.role) {
        const messageData: SendMessageData = {
          sessionId: sessionId as string,
          message,
          sender: session?.user.role,
        };
        socket.emit("sendMessage", messageData);
      }
    },
    [socket, session?.user.role, sessionId]
  );

  return { socket, messages, sendMessage };
};

export default useSocket;
