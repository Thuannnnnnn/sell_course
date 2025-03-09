"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Forum");
  const params = useParams();
  const locale = params.locale as string;
  const userId = session?.user?.user_id || "";

  const [isProcessing, setIsProcessing] = useState(false);
  const [allReactions, setAllReactions] = useState<Reaction[]>(reactions);

  // Hàm đồng bộ reactions từ server
  const syncReactions = async () => {
    if (!session?.user?.token) return null;
    const result = await getReactionsByTopic(session.user.token, forumId);
    console.log("Dữ liệu từ server:", result);
    if (result.success && Array.isArray(result.data)) {
      setAllReactions(result.data);
      // Không gọi onReactionChange ở đây để tránh vòng lặp
      return result.data;
    }
    console.error("Lỗi đồng bộ reactions:", result.error);
    return null;
  };

  // Chỉ đồng bộ khi forumId hoặc token thay đổi
  useEffect(() => {
    syncReactions();
  }, [forumId, session?.user?.token]); // Loại bỏ `reactions` khỏi dependencies

  useEffect(
    () => onProcessingChange?.(isProcessing),
    [isProcessing, onProcessingChange]
  );

  // Tính số lượng reaction theo loại
  const reactionCounts = useMemo(() => {
    return allReactions.reduce((counts, reaction) => {
      counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1;
      return counts;
    }, {} as Record<ReactionType, number>);
  }, [allReactions]);

  // Tìm reaction của người dùng hiện tại
  const userReaction = useMemo(() => {
    const reaction = allReactions.find((r) => r.user?.user_id === userId);
    console.log("Reaction của người dùng:", reaction);
    return reaction;
  }, [allReactions, userId]);

  // Xử lý khi người dùng bấm reaction
  const handleReaction = async (type: ReactionType) => {
    if (!session?.user?.token) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    setIsProcessing(true);
    const token = session.user.token;

    try {
      // Lấy dữ liệu hiện tại từ state
      const currentReactions = allReactions;
      console.log("Reactions hiện tại:", currentReactions);

      // Tìm reaction của người dùng
      const currentUserReaction = currentReactions.find(
        (r) => r.user?.user_id === userId
      );
      console.log("Reaction hiện tại của người dùng:", currentUserReaction);

      const hasUserReaction = !!currentUserReaction;
      const isSameType = currentUserReaction?.reactionType === type;

      let updatedReactions;

      if (hasUserReaction && isSameType) {
        // Xóa reaction nếu đã tồn tại và cùng loại
        console.log("Đang xóa reaction...");
        updatedReactions = currentReactions.filter(
          (r) => r.user?.user_id !== userId
        );
        setAllReactions(updatedReactions);

        const result = await deleteReactionFromTopic(token, userId, forumId);
        console.log("Kết quả xóa reaction:", result);
        if (!result.success) throw new Error("Không thể xóa reaction");
      } else {
        // Thêm hoặc cập nhật reaction
        console.log("Đang thêm/cập nhật reaction...");
        updatedReactions = hasUserReaction
          ? currentReactions.filter((r) => r.user?.user_id !== userId)
          : [...currentReactions];

        if (hasUserReaction) {
          const deleteResult = await deleteReactionFromTopic(
            token,
            userId,
            forumId
          );
          console.log("Kết quả xóa reaction cũ:", deleteResult);
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
        console.log("Kết quả thêm reaction:", addResult);
        if (!addResult.success) throw new Error("Không thể thêm reaction");
      }

      // Đồng bộ lại dữ liệu từ server sau khi xử lý
      const finalReactions = await syncReactions();
      if (finalReactions) {
        onReactionChange?.(finalReactions); // Chỉ gọi onReactionChange sau khi đồng bộ
      }
    } catch (error) {
      console.error("Lỗi xử lý reaction:", error);
      setAllReactions(reactions); // Rollback nếu có lỗi
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
