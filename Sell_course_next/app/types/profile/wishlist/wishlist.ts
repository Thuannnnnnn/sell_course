export interface WishlistRequestDto {
  userId: string;
  courseId: string;
  save: boolean;
}

export interface WishlistResponseDto {
  wishlistId: string;
  courseId: string;
  user: {
    user_id: string;
    name: string;
    email: string;
  };
  course: {
    courseId: string;
    title: string;
    description: string;
    short_description: string;
    duration: number;
    price: number;
    videoIntro: string | null;
    thumbnail: string;
    rating: number;
    skill: string;
    level: string;
    status: boolean;
    instructorName: string;
  };
  save: boolean;
}