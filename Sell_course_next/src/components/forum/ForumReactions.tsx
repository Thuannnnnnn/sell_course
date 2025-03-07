"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// Định nghĩa các loại reaction
type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

// Emoji cho từng loại reaction
const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

// Định nghĩa interface cho reaction
interface Reaction {
  reactionId: string;
  reactionType: ReactionType;
  createdAt: string;
}

// Component ForumReactions
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

  // Cập nhật danh sách reactions khi props thay đổi
  useEffect(() => {
    setAllReactions(reactions);
  }, [reactions]);

  // Kiểm tra xem người dùng hiện tại đã reaction chưa từ danh sách reactions
  const userReaction = allReactions.find(reaction => {
    const reactionUserId = reaction.reactionId.split('_')[0];
    return reactionUserId === (session?.user?.user_id || '');
  });

  // Log trạng thái hiện tại để debug
  useEffect(() => {
    console.log("Current reaction state:", {
      userReaction: userReaction?.reactionType,
      allReactionsCount: allReactions.length,
      reactionCounts: countReactions(),
      userReactionExists: !!userReaction
    });
  }, [userReaction, allReactions]);

  // Đếm số lượng reaction theo loại
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
      console.log(`Handling reaction click: ${type}`);
      
      // Kiểm tra xem user đã có reaction này chưa
      const hasThisReaction = userReaction?.reactionType === type;
      console.log(`User has this reaction: ${hasThisReaction}`);
      
      if (hasThisReaction) {
        console.log(`User clicked on their own emoji (${type}), removing it`);
        
        // Cập nhật danh sách reactions ngay lập tức trong UI
        const optimisticUpdatedReactions = allReactions.filter(reaction => {
          const reactionUserId = reaction.reactionId.split('_')[0];
          return reactionUserId !== userId;
        });

        setAllReactions(optimisticUpdatedReactions);

        // Thông báo thay đổi cho component cha
        if (onReactionChange) {
          onReactionChange(optimisticUpdatedReactions);
        }

        // Gọi API để xóa reaction
        const deleteUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic/${userId}/${forumId}`;
        console.log("Deleting reaction with direct endpoint:", deleteUrl);
        
        // Sử dụng fetch API để gọi DELETE endpoint
        fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log("Delete response status:", response.status);
          if (!response.ok) {
            console.log("Delete reaction failed, status:", response.status);
          }
        })
        .catch(error => {
          console.error("Error deleting reaction:", error);
        });
      } else {
        // Nếu chọn emoji khác hoặc chưa có reaction
        
        // Nếu đã có reaction trước đó, xóa nó trước
        if (userReaction) {
          // Gọi API để xóa reaction cũ
          const deleteUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic/${userId}/${forumId}`;
          console.log("Deleting previous reaction:", deleteUrl);
          
          await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }

        // Tạo reaction mới cho UI
        const newReaction: Reaction = {
          reactionId: `${userId}_${Date.now()}`,
          reactionType: type,
          createdAt: new Date().toISOString()
        };

        // Tạo bản sao của danh sách reactions hiện tại
        let optimisticUpdatedReactions = [...allReactions];

        // Xóa TẤT CẢ reactions của người dùng hiện tại khỏi danh sách
        optimisticUpdatedReactions = optimisticUpdatedReactions.filter(reaction => {
          const reactionUserId = reaction.reactionId.split('_')[0];
          return reactionUserId !== userId;
        });

        // Thêm reaction mới vào UI
        optimisticUpdatedReactions.push(newReaction);
        setAllReactions(optimisticUpdatedReactions);

        // Thông báo thay đổi cho component cha
        if (onReactionChange) {
          onReactionChange(optimisticUpdatedReactions);
        }

        // Gọi API để thêm reaction mới
        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic`;
        console.log("Adding reaction:", apiUrl);
        
        // Sử dụng fetch API để gọi POST endpoint
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, forumId, reactionType: type })
        })
        .then(response => {
          console.log("Add response status:", response.status);
          if (!response.ok) {
            console.log("Add reaction failed, status:", response.status);
          }
        })
        .catch(error => {
          console.error("Error adding reaction:", error);
        });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="reaction-container position-relative">
      {/* Hiển thị trạng thái xử lý */}
      {isProcessing && (
        <div className="position-absolute top-0 start-50 translate-middle-x" style={{ zIndex: 10 }}>
          <div className="badge bg-info text-white py-1 px-2">
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Đang xử lý...
          </div>
        </div>
      )}

      {/* Hiển thị reaction hiện tại hoặc nút like mặc định */}
      {userReaction ? (
        <button
          className={`btn btn-primary me-2 ${isProcessing ? "disabled" : ""}`}
          onClick={() => {
            console.log(`Main button clicked, current reaction: ${userReaction.reactionType}`);
            handleReaction(userReaction.reactionType);
          }}
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
      ) : (
        <button
          className={`btn btn-outline-primary me-2 ${isProcessing ? "disabled" : ""}`}
          onClick={() => handleReaction("like")}
          disabled={isProcessing}
        >
          <i className="bi bi-hand-thumbs-up me-1"></i> {t("like")}
        </button>
      )}

      {/* Các nút emoji luôn hiển thị */}
      <div className="d-inline-flex">
        {Object.entries(reactionEmojis).map(([type, emoji]) => {
          const reactionType = type as ReactionType;
          const count = reactionCounts[reactionType] || 0;

          // Kiểm tra xem emoji này có phải là reaction của người dùng không
          const isUserReaction = userReaction?.reactionType === reactionType;

          // Kiểm tra xem emoji này có trong danh sách reactions không
          const hasReactions = count > 0;

          return (
            <button
              key={type}
              className={`btn mx-1 position-relative ${isUserReaction ? "btn-primary" : "btn-light"} ${hasReactions ? "border-info" : ""}`}
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

      {/* CSS cơ bản */}
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
      `}</style>
    </div>
  );
};

export default ForumReactions;