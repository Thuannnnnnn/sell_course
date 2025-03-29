export enum InteractionType {
  VIEW = "VIEW",
  WISHLIST = "WISHLIST",
  PURCHASE = "PURCHASE",
}

export interface Interaction {
  id?: string;
  user: {
    user_id: string;
  };
  course: {
    courseId: string;
  };
  interaction_type: InteractionType;
}

export interface InteractionResponseDTO {
  id: string;
  userId: string;
  courseId: string;
  interaction_type: InteractionType;
}
