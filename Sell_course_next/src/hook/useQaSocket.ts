// useQaSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { QaData } from "@/app/type/QAStudy/QAStudy";

export const useQaSocket = (courseId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [qaList, setQaList] = useState<QaData[]>([]);

  useEffect(() => {
    if (!courseId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
    });

    // Request initial QA list
    newSocket.emit("getQas", courseId);

    // Listen for QA list updates
    newSocket.on("qaList", (data: QaData[]) => {
      setQaList(data);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [courseId]);

  return { socket, qaList };
};
