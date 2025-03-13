export interface ResponseFeedbackRatingDto {
  feedbackRattingId: string;
  star: number;
  feedback?: string;
  createdAt: string;
  user: {
    user_id: string;
    email: string;
    username: string;
    avatarImg: string;
    role: string;
  };
  course: {
    courseId: string;
    title: string;
    price: number;
    description: string;
    videoInfo: string;
    imageInfo: string;
  };
}