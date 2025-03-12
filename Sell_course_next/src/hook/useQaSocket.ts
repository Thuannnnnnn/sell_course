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

    newSocket.emit("joinCourse", courseId);

    newSocket.on("qaList", (data) => {
      setQaList(data);
    });

    newSocket.on("newQa", (qa) => {
      setQaList((prevQaList) => [...prevQaList, qa]);
    });

    newSocket.on("removeQa", ({ qaId }) => {
      setQaList((prevQaList) => prevQaList.filter((qa) => qa.qaId !== qaId));
    });

    newSocket.on("reactionChange", (reaction) => {
      setQaList((prevQaList) =>
        prevQaList.map((qa) =>
          qa.qaId === reaction.qaId ? { ...qa, reaction: reaction } : qa
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leaveCourse", courseId);
      newSocket.disconnect();
    };
  }, [courseId]);

  return { socket, qaList };
};
