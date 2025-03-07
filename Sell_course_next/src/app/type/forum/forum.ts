export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

// Reaction interface
export interface Reaction {
  reactionId: string;
  reactionType: ReactionType;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

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

export const validateReactionType = (type: string): ReactionType => {
    const validTypes: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];
    return validTypes.includes(type as ReactionType)
      ? (type as ReactionType)
      : "like"; // Default to "like" if invalid
  };

export interface ReactionTopic {
  reactionId: string;
  reactionType: string;
  createdAt: string;
}

export interface Discussion {
  discussionId: string;
  content: string;
  createdAt: string;
}

export interface Forum {
  forumId: string;
  title: string;
  image: string;
  text: string;
  createdAt: string;
  user: User;
  reactionTopics: ReactionTopic[];
  discussions: Discussion[];
}

export interface CreateForumDto {
  userId: string;
  title: string;
  text: string;
  image?: File | null;
}
