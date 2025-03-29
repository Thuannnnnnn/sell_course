export interface UserAnswerPayload {
  userId: string;
  answers: { questionId: string; answer: string }[];
}
