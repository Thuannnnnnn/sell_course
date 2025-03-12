export type ReactionQa = {
  userEmail: string;
  reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry";
};

export type QaData = {
  qaId: string;
  userEmail: string;
  username: string;
  courseId: string;
  text: string;
  parentId?: string | null;
  createdAt: string;
  avatarImg?: string;
  reactionQas?: ReactionQa[];
};
