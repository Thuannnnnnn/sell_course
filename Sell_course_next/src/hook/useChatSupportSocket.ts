import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";

// Định nghĩa interface cho message
interface ChatMessage {
  sessionId: string;
  sender: {
    user_id: string;
    username: string;
    avatarImg: string;
    email: string;
    role: string;
    isBan: boolean;
    isOAuth: boolean;
    phoneNumber: string | null;
    birthDay: string | null;
    gender: string | null;
    createdAt: string;
    updatedAt: string;
  };
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
  socket: typeof Socket | null;
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
}

const useSocket = (sessionId: string | string[]): UseSocketResult => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { data: session } = useSession();

  // Khởi tạo và quản lý kết nối WebSocket
  useEffect(() => {
    console.log("Initializing WebSocket connection with sessionId:", sessionId);
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
      autoConnect: true,
      query: { sessionId },
    });
    setSocket(newSocket);

    // Xử lý sự kiện connect
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      newSocket.emit("join", { sessionId });
    });

    // Xử lý sự kiện nhận message
    newSocket.on("message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Xử lý sự kiện đóng tab
    const handleBeforeUnload = () => {
      console.log("Before unload - Disconnecting with sessionId:", sessionId);
      if (newSocket) {
        newSocket.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup khi component unmount
    return () => {
      console.log(
        "Component unmounting - Disconnecting with sessionId:",
        sessionId
      );
      window.removeEventListener("beforeunload", handleBeforeUnload);
      newSocket.disconnect();
      setSocket(null);
    };
  }, [sessionId]);

  // Hàm gửi tin nhắn
  const sendMessage = useCallback(
    (message: string) => {
      if (socket && message.trim() && session?.user.user_id) {
        const messageData: SendMessageData = {
          sessionId: sessionId as string,
          message,
          sender: session?.user.user_id,
        };
        socket.emit("sendMessage", messageData);
      }
    },
    [socket, session?.user.user_id, sessionId]
  );

  return { socket, messages, sendMessage };
};

export default useSocket;
