"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Reaction, reactionEmojis, ReactionType } from "@/app/type/forum/forum";

interface ForumReactionsReadOnlyProps {
  reactions?: Reaction[];
}

const ForumReactionsReadOnly: React.FC<ForumReactionsReadOnlyProps> = ({
  reactions = []
}) => {
  const t = useTranslations("Forum");

  const countReactions = () => {
    return reactions.reduce((counts, reaction) => {
      const type = reaction.reactionType;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<ReactionType, number>);
  };

  const reactionCounts = countReactions();

  const activeReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .map(([type]) => type as ReactionType);

  if (activeReactions.length === 0) {
    return (
      <div className="text-muted small">
        <i className="bi bi-hand-thumbs-up me-1"></i> 0
      </div>
    );
  }

  return (
    <div className="reaction-summary d-flex align-items-center">
      <div className="d-flex">
        {activeReactions.map((type) => (
          <div
            key={type}
            className="reaction-badge me-1"
            title={`${t(type)}: ${reactionCounts[type]}`}
          >
            <span className="reaction-emoji">{reactionEmojis[type]}</span>
            <span className="reaction-count">{reactionCounts[type]}</span>
          </div>
        ))}
      </div>
      <div className="total-reactions ms-2 text-muted small">
        {reactions.length > 0 && (
          <span>{reactions.length} {reactions.length === 1 ? t('reaction') : t('reactions')}</span>
        )}
      </div>
      <style jsx>{`
        .reaction-summary {
          font-size: 0.9rem;
        }
        .reaction-badge {
          display: flex;
          align-items: center;
          background-color: #f0f2f5;
          border-radius: 12px;
          padding: 2px 6px;
        }
        .reaction-emoji {
          font-size: 0.9rem;
          margin-right: 3px;
        }
        .reaction-count {
          font-size: 0.8rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ForumReactionsReadOnly;