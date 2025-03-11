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

  const syncReactions = useCallback(async () => {
    if (!session?.user?.token) return null;
    const result = await getReactionsByTopic(session.user.token, forumId);
    if (result.success && Array.isArray(result.data)) {
      setAllReactions(result.data);
      return result.data;
    }
    return null;
  }, [forumId, session?.user?.token, setAllReactions]);

  useEffect(() => {
    syncReactions();
  }, [forumId, session?.user?.token, syncReactions]);

  useEffect(
    () => onProcessingChange?.(isProcessing),
    [isProcessing, onProcessingChange]
  );

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

    setIsProcessing(false);
    const token = session.user.token;

    try {
      const currentReactions = allReactions;
      const currentUserReaction = currentReactions.find(
        (r) => r.user?.user_id === userId
      );
      const hasUserReaction = !!currentUserReaction;
      const isSameType = currentUserReaction?.reactionType === type;

      let updatedReactions;

      if (hasUserReaction && isSameType) {
        updatedReactions = currentReactions.filter(
          (r) => r.user?.user_id !== userId
        );
        setAllReactions(updatedReactions);

        const result = await deleteReactionFromTopic(token, userId, forumId);
        if (!result.success) throw new Error("Không thể xóa reaction");
      } else {
        updatedReactions = hasUserReaction
          ? currentReactions.filter((r) => r.user?.user_id !== userId)
          : [...currentReactions];

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
          user: { user_id: userId },
          reactionId: `${userId}_temp`,
          reactionType: type,
          createdAt: new Date().toISOString(),
        };
        updatedReactions.push(tempReaction);
        setAllReactions(updatedReactions);

        const addResult = await addReactionToTopic(
          token,
          userId,
          forumId,
          type
        );
        if (!addResult.success) throw new Error("Không thể thêm reaction");
      }

      const finalReactions = await syncReactions();
      if (finalReactions) {
        onReactionChange?.(finalReactions);
      }
    } catch {
      setAllReactions(reactions);
      onReactionChange?.(reactions);
      await syncReactions();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="reaction-container">
      {isProcessing && <div className="processing-badge">Đang xử lý...</div>}
      {Object.entries(reactionEmojis).map(([type, emoji]) => {
        const reactionType = type as ReactionType;
        const count = reactionCounts[reactionType] || 0;
        const isActive = userReaction?.reactionType === reactionType;

        return (
          <button
            key={type}
            className={`btn ${isActive ? "btn-primary" : "btn-light"}`}
            onClick={() => handleReaction(reactionType)}
            disabled={isProcessing}
          >
            {emoji}{" "}
            {count > 0 && (
              <span
                className="badge text-dark"
                style={{ backgroundColor: "#f0f2f5", color: "black" }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ForumReactions;
