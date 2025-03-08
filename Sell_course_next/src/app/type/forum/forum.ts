// types/forum.ts (hoặc tên file tương ứng)

// ReactionType
export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

// Reaction Emojis
export const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

// Reaction Interface (Gộp ReactionTopic vào đây)
export interface Reaction {
  userId: string;
  reactionId: string;
  reactionType: ReactionType;
  createdAt: string;
  user?: Partial<User>; // Optional nếu cần thông tin user từ backend
}

// API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// User Interface
export interface User {
  user_id: string;
  email: string;
  username: string;
  password: string;
  avatarImg: string;
  gender: string;
  birthDay: string;
  phoneNumber: string;
  role: string;
  isOAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

// Discussion Interface
export interface Discussion {
  discussionId: string;
  content: string;
  createdAt: string;
}

// Forum Interface (Sử dụng Reaction thay vì ReactionTopic)
export interface Forum {
  forumId: string;
  title: string;
  image: string;
  text: string;
  createdAt: string;
  user: User;
  reactions: Reaction[]; // Thay reactionTopics bằng reactions
  discussions: Discussion[];
}

// CreateForumDto Interface
export interface CreateForumDto {
  userId: string;
  title: string;
  text: string;
  image?: File | null;
}

// Validate ReactionType Utility
export const validateReactionType = (type: string): ReactionType => {
  const validTypes: ReactionType[] = [
    "like",
    "love",
    "haha",
    "wow",
    "sad",
    "angry",
  ];
  return validTypes.includes(type as ReactionType)
    ? (type as ReactionType)
    : "like";
};
