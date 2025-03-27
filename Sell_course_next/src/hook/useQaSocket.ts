// useQaSocket.ts
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { QaData } from "@/app/type/QAStudy/QAStudy";

export const useQaSocket = (courseId: string) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [qaList, setQaList] = useState<QaData[]>([]);

  useEffect(() => {
    if (!courseId) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
      {
        transports: ["websocket"],
      }
    );

    // Request initial QA list
    newSocket.emit("getQas", courseId);

    // Listen for QA list updates
    newSocket.on("qaList", (data: QaData[]) => {
      setQaList(data);
    });

    newSocket.on("error", () => {
      console.error("Socket error:");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [courseId]);

  return { socket, qaList };
};
