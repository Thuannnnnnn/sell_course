"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ReactionType, reactionEmojis, Reaction } from "@/app/type/forum/forum";
import {
  addReactionToTopic,
  deleteReactionFromTopic,
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
  const t = useTranslations("Forum");
  const params = useParams();
  const locale = params.locale as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [allReactions, setAllReactions] = useState<Reaction[]>(reactions);

  useEffect(() => {
    console.log("Reactions from props:", reactions);
    setAllReactions(reactions); // Đồng bộ với dữ liệu từ server
  }, [reactions]);

  useEffect(() => {
    if (onProcessingChange) {
      onProcessingChange(isProcessing);
    }
  }, [isProcessing, onProcessingChange]);

  const countReactions = () => {
    return allReactions.reduce((counts, reaction) => {
      const type = reaction.reactionType;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<ReactionType, number>);
  };

  const reactionCounts = countReactions();
  const userId = session?.user?.user_id || "";

  // Giả định tạm thời reactionId có thể không chứa userId
  const getUserReaction = (userId: string) => {
    return allReactions.find((reaction) => {
      const reactionUserId = reaction.reactionId.split("_")[0].trim();
      console.log(`Checking: ${reactionUserId} === ${reactionUserId}`);
      return reactionUserId === reactionUserId;
    });
  };

  const userReaction = getUserReaction(userId);

  const handleReaction = async (type: ReactionType) => {
    if (!session?.user?.token || !userId) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    setIsProcessing(true);
    const token = session.user.token;

    try {
      console.log("Before action - allReactions:", allReactions);
      console.log("User ID:", userId);
      console.log("User reaction:", userReaction);
      const hasUserReaction = !!userReaction;
      const isSameType = userReaction?.reactionType === type;
      console.log("Has user reaction:", hasUserReaction);
      console.log("Is same type:", isSameType);

      if (hasUserReaction && isSameType) {
        // Xóa reaction nếu nhấn lại cùng type
        const optimisticUpdatedReactions = allReactions.filter((reaction) => {
          const reactionUserId = reaction.reactionId.split("_")[0];
          return reactionUserId !== userId;
        });

        console.log("After optimistic delete:", optimisticUpdatedReactions);
        setAllReactions(optimisticUpdatedReactions);
        if (onReactionChange) {
          onReactionChange(optimisticUpdatedReactions);
        }

        const result = await deleteReactionFromTopic(token, userId, forumId);
        console.log("Delete API result:", result);
        if (!result.success) {
          throw new Error(result.error || "Failed to delete reaction");
        }
      } else {
        // Xóa reaction cũ (nếu có) và thêm reaction mới
        let optimisticUpdatedReactions = hasUserReaction
          ? allReactions.filter((reaction) => {
              const reactionUserId = reaction.reactionId.split("_")[0];
              return reactionUserId !== userId;
            })
          : [...allReactions];

        const tempReaction: Reaction = {
          userId,
          reactionId: `${userId}_temp`, // Tạm thời, sẽ được server cập nhật
          reactionType: type,
          createdAt: new Date().toISOString(),
        };
        optimisticUpdatedReactions.push(tempReaction);
        console.log("After optimistic add:", optimisticUpdatedReactions);
        setAllReactions(optimisticUpdatedReactions);
        if (onReactionChange) {
          onReactionChange(optimisticUpdatedReactions);
        }

        // Gọi API xóa trước nếu user đã có reaction khác type
        if (hasUserReaction) {
          const deleteResult = await deleteReactionFromTopic(
            token,
            userId,
            forumId
          );
          console.log("Pre-delete API result:", deleteResult);
          if (!deleteResult.success) {
            throw new Error(
              deleteResult.error || "Failed to delete existing reaction"
            );
          }
        }

        const addResult = await addReactionToTopic(
          token,
          userId,
          forumId,
          type
        );
        console.log("Add API result:", addResult);
        if (!addResult.success) {
          throw new Error(addResult.error || "Failed to add reaction");
        }
      }

      // Đồng bộ dữ liệu từ server
      window.dispatchEvent(
        new CustomEvent("forumReactionChanged", { detail: { forumId } })
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Reaction error:", errorMessage);
      setAllReactions(reactions); // Rollback nếu lỗi
      if (onReactionChange) {
        onReactionChange(reactions);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="reaction-container position-relative">
      {isProcessing && (
        <div
          className="position-absolute top-0 start-50 translate-middle-x"
          style={{ zIndex: 10 }}
        >
          <div className="badge bg-info text-white py-1 px-2">
            <span
              className="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            Đang xử lý...
          </div>
        </div>
      )}
      {userReaction && (
        <button
          className={`btn btn-primary me-2 ${isProcessing ? "disabled" : ""}`}
          onClick={() => handleReaction(userReaction.reactionType)}
          disabled={isProcessing}
          title="Click để bỏ reaction"
        >
          {reactionEmojis[userReaction.reactionType]}{" "}
          {t(userReaction.reactionType)}
          {reactionCounts[userReaction.reactionType] > 0 && (
            <span className="ms-1 badge bg-light text-primary">
              {reactionCounts[userReaction.reactionType]}
            </span>
          )}
        </button>
      )}
      <div className="d-flex flex-wrap">
        {Object.entries(reactionEmojis).map(([type, emoji]) => {
          const reactionType = type as ReactionType;
          const count = reactionCounts[reactionType] || 0;
          const isUserReaction = userReaction?.reactionType === reactionType;
          const hasReactions = count > 0;

          return (
            <button
              key={type}
              className={`btn mx-1 mb-1 position-relative ${
                isUserReaction ? "btn-primary" : "btn-light"
              } ${hasReactions ? "border-info" : ""}`}
              onClick={() => handleReaction(reactionType)}
              disabled={isProcessing}
              title={`${t(reactionType)} (${count} ${
                count === 1 ? "người" : "người"
              })`}
            >
              {emoji}
              {hasReactions && (
                <span
                  className={`position-absolute top-0 start-100 translate-middle badge rounded-pill ${
                    isUserReaction ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .reaction-container {
          display: flex;
          align-items: center;
        }
        .btn-light,
        .btn-primary {
          padding: 5px 10px;
          font-size: 1.2rem;
        }
        .btn-light.active,
        .btn-primary {
          background-color: #e6f2ff;
          border-color: #0d6efd;
        }
        .badge {
          font-size: 0.7rem;
        }
        .btn-light:hover {
          background-color: #f8f9fa;
          border-color: #dae0e5;
          transform: scale(1.05);
          transition: transform 0.2s;
        }
        .btn-primary:hover {
          transform: scale(1.05);
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  );
};

export default ForumReactions;
