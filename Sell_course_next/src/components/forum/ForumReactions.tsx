"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ReactionType, reactionEmojis, Reaction } from "@/app/type/forum/forum";
import { addReactionToTopic, deleteReactionFromTopic } from "@/app/api/forum/forum";

interface ForumReactionsProps {
  forumId: string;
  reactions?: Reaction[];
  onReactionChange?: (reactions: Reaction[]) => void;
}

const ForumReactions: React.FC<ForumReactionsProps> = ({
  forumId,
  reactions = [],
  onReactionChange
}) => {
  const { data: session } = useSession();
  const t = useTranslations("Forum");
  const params = useParams();
  const locale = params.locale as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [allReactions, setAllReactions] = useState<Reaction[]>(reactions);

  useEffect(() => {
    setAllReactions(reactions);
  }, [reactions]);

  const userReaction = allReactions.find(reaction => {
    const reactionUserId = reaction.reactionId.split('_')[0];
    return reactionUserId === (session?.user?.user_id || '');
  });

  const countReactions = () => {
    return allReactions.reduce((counts, reaction) => {
      const type = reaction.reactionType;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<ReactionType, number>);
  };

  const reactionCounts = countReactions();

  const handleReaction = async (type: ReactionType) => {
    if (!session?.user?.token || !session?.user?.user_id) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    setIsProcessing(true);
    const userId = session.user.user_id;
    const token = session.user.token;

    try {
      const hasThisReaction = userReaction?.reactionType === type;

      if (hasThisReaction) {
        const optimisticUpdatedReactions = allReactions.filter(reaction => {
          const reactionUserId = reaction.reactionId.split('_')[0];
          return reactionUserId !== userId;
        });

        setAllReactions(optimisticUpdatedReactions);

        if (onReactionChange) {
          onReactionChange(optimisticUpdatedReactions);
        }

        const result = await deleteReactionFromTopic(token, userId, forumId);
        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        if (userReaction) {
          const deleteResult = await deleteReactionFromTopic(token, userId, forumId);
          if (!deleteResult.success) {
            throw new Error(deleteResult.error);
          }
        }

        const newReaction: Reaction = {
          reactionId: `${userId}_${Date.now()}`,
          reactionType: type,
          createdAt: new Date().toISOString()
        };

        let optimisticUpdatedReactions = [...allReactions];

        optimisticUpdatedReactions = optimisticUpdatedReactions.filter(reaction => {
          const reactionUserId = reaction.reactionId.split('_')[0];
          return reactionUserId !== userId;
        });

        optimisticUpdatedReactions.push(newReaction);
        setAllReactions(optimisticUpdatedReactions);

        if (onReactionChange) {
          onReactionChange(optimisticUpdatedReactions);
        }

        const addResult = await addReactionToTopic(token, userId, forumId, type);
        if (!addResult.success) {
          throw new Error(addResult.error);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="reaction-container position-relative">
      {isProcessing && (
        <div className="position-absolute top-0 start-50 translate-middle-x" style={{ zIndex: 10 }}>
          <div className="badge bg-info text-white py-1 px-2">
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
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
          {reactionEmojis[userReaction.reactionType]} {t(userReaction.reactionType)}
          {reactionCounts[userReaction.reactionType] > 0 &&
            <span className="ms-1 badge bg-light text-primary">
              {reactionCounts[userReaction.reactionType]}
            </span>
          }
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
              className={`btn mx-1 mb-1 position-relative ${isUserReaction ? "btn-primary" : "btn-light"} ${hasReactions ? "border-info" : ""}`}
              onClick={() => handleReaction(reactionType)}
              disabled={isProcessing}
              title={`${t(reactionType)} (${count} ${count === 1 ? 'người' : 'người'})`}
            >
              {emoji}
              {hasReactions && (
                <span className={`position-absolute top-0 start-100 translate-middle badge rounded-pill ${isUserReaction ? "bg-success" : "bg-secondary"}`}>
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
        .btn-light, .btn-primary {
          padding: 5px 10px;
          font-size: 1.2rem;
        }
        .btn-light.active, .btn-primary {
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