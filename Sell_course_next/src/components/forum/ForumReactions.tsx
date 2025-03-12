"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Reaction, reactionEmojis, ReactionType } from "@/app/type/forum/forum";
import {
  addReactionToTopic,
  deleteReactionFromTopic,
  getReactionsByTopic,
} from "@/app/api/forum/forum";
import { io, Socket } from "socket.io-client";

interface ForumReactionsProps {
  forumId: string;
  reactions?: Reaction[];
  onReactionChange?: (reactions: Reaction[]) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

const ForumReactions: React.FC<ForumReactionsProps> = ({
  forumId,
  reactions = [],
  onReactionChange,
  onProcessingChange,
}) => {
  const { data: session } = useSession();
  const params = useParams();
  const locale = params.locale as string;
  const userId = session?.user?.user_id || "";

  const [isProcessing, setIsProcessing] = useState(false);
  const [allReactions, setAllReactions] = useState<Reaction[]>(reactions);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Đồng bộ allReactions với props reactions
  useEffect(() => {
    setAllReactions(reactions);
  }, [reactions]);

  // Kết nối WebSocket
  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
      {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token: session?.user?.token },
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.token]);

  // Lắng nghe sự kiện từ server
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server for reactions");
      socket.emit("joinForumRoom", forumId);
    });

    socket.on("forumReactionsUpdated", (data: { forumId: string; reactions: Reaction[] }) => {
      if (data.forumId === forumId) {
        setAllReactions(data.reactions);
        onReactionChange?.(data.reactions);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      if (socket.connected) {
        socket.emit("leaveForumRoom", forumId);
      }
      socket.off("connect");
      socket.off("forumReactionsUpdated");
      socket.off("disconnect");
    };
  }, [socket, forumId, onReactionChange]);

  const syncReactions = useCallback(async () => {
    if (!session?.user?.token) return null;
    const result = await getReactionsByTopic(session.user.token, forumId);
    if (result.success && Array.isArray(result.data)) {
      setAllReactions(result.data);
      onReactionChange?.(result.data);
      return result.data;
    }
    return null;
  }, [forumId, session?.user?.token]);

  useEffect(() => {
    syncReactions();
  }, [syncReactions]);

  useEffect(() => {
    onProcessingChange?.(isProcessing);
  }, [isProcessing, onProcessingChange]);

  const reactionCounts = useMemo(() => {
    return allReactions.reduce((counts, reaction) => {
      counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1;
      return counts;
    }, {} as Record<ReactionType, number>);
  }, [allReactions]);

  const userReaction = useMemo(() => {
    return allReactions.find((r) => r.user?.user_id === userId);
  }, [allReactions, userId]);

  const handleReaction = async (type: ReactionType) => {
    if (!session?.user?.token) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    setIsProcessing(true);
    const token = session.user.token;

    try {
      const currentUserReaction = allReactions.find(
        (r) => r.user?.user_id === userId
      );
      const hasUserReaction = !!currentUserReaction;
      const isSameType = currentUserReaction?.reactionType === type;

      let updatedReactions;

      if (hasUserReaction && isSameType) {
        updatedReactions = allReactions.filter(
          (r) => r.user?.user_id !== userId
        );
        setAllReactions(updatedReactions);
        onReactionChange?.(updatedReactions);

        const result = await deleteReactionFromTopic(token, userId, forumId);
        if (!result.success) throw new Error("Không thể xóa reaction");

        if (socket && socket.connected) {
          socket.emit("updateForumReactions", {
            forumId,
            action: "delete",
            userId,
          });
        }
      } else {
        updatedReactions = hasUserReaction
          ? allReactions.filter((r) => r.user?.user_id !== userId)
          : [...allReactions];

        if (hasUserReaction) {
          const deleteResult = await deleteReactionFromTopic(
            token,
            userId,
            forumId
          );
          if (!deleteResult.success)
            throw new Error("Không thể xóa reaction cũ");
        }

        const tempReaction: Reaction = {
          userId: userId,
          user: {
            user_id: userId,
            username: session.user.username,
            avatarImg: session.user.avatarImg || "",
            email: session.user.email || "",
            gender: session.user.gender || "",
            birthDay: session.user.birthDay || "",
            phoneNumber: session.user.phoneNumber || "",
            role: session.user.role || "",
          },
          reactionId: `${userId}_temp_${Date.now()}`,
          reactionType: type,
          createdAt: new Date().toISOString(),
        };
        updatedReactions.push(tempReaction);
        setAllReactions(updatedReactions);
        onReactionChange?.(updatedReactions);

        const addResult = await addReactionToTopic(
          token,
          userId,
          forumId,
          type
        );
        if (!addResult.success) throw new Error("Không thể thêm reaction");

        if (socket && socket.connected) {
          socket.emit("updateForumReactions", {
            forumId,
            action: "add",
            userId,
            reactionType: type,
          });
        }
      }

      await syncReactions();
    } catch (error) {
      console.error("Error handling reaction:", error);
      await syncReactions();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="reaction-container d-flex gap-2">
      {isProcessing && <div className="processing-badge">Đang xử lý...</div>}
      {Object.entries(reactionEmojis).map(([type, emoji]) => {
        const reactionType = type as ReactionType;
        const count = reactionCounts[reactionType] || 0;
        const isActive = userReaction?.reactionType === reactionType;

        return (
          <button
            key={type}
            className={`btn ${
              isActive ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => handleReaction(reactionType)}
            disabled={isProcessing}
          >
            {emoji}{" "}
            {count > 0 && (
              <span className="badge bg-light text-dark">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ForumReactions;
