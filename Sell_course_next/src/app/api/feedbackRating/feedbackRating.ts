import axios from "axios";
import { ResponseFeedbackRatingDto } from "@/app/type/feedbackRating/feedbackRating";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Get all feedback ratings
export async function getAllFeedbackRatings(): Promise<ResponseFeedbackRatingDto[]> {
  try {
    const response = await axios.get<ResponseFeedbackRatingDto[]>(`${BACKEND_URL}/feedback-ratting`);
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback ratings:", error);
    throw error;
  }
}

// Get feedback rating by course ID
export async function getFeedbackRatingByCourseId(courseId: string): Promise<ResponseFeedbackRatingDto[]> {
  try {
    const response = await axios.get<ResponseFeedbackRatingDto[]>(`${BACKEND_URL}/feedback-ratting/${courseId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message === "No feedback found for this course") {
      return []; // Trả về danh sách rỗng thay vì null hoặc lỗi
    }
    console.error("Error fetching feedback rating by course ID:", error);
    throw error;
  }
}


// Create a new feedback rating
export async function createFeedbackRating(
  userId: string,
  courseId: string,
  star: number,
  feedback?: string,
  token?: string
): Promise<ResponseFeedbackRatingDto> {
  try {
    const response = await axios.post<ResponseFeedbackRatingDto>(
      `${BACKEND_URL}/feedback-ratting`,
      { user_id: userId, courseId, star, feedback },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating feedback rating:", error);
    throw error;
  }
}

// Update a feedback rating
export async function updateFeedbackRating(
  feedbackRatingId: string,
  star?: number,
  feedback?: string,
  token?: string
): Promise<ResponseFeedbackRatingDto> {
  try {
    const response = await axios.put<ResponseFeedbackRatingDto>(
      `${BACKEND_URL}/feedback-ratting/${feedbackRatingId}`,
      { star, feedback },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating feedback rating:", error);
    throw error;
  }
}

// Delete a feedback rating
export async function deleteFeedbackRating(feedbackRatingId: string, token?: string): Promise<void> {
  try {
    await axios.delete(`${BACKEND_URL}/feedback-ratting/${feedbackRatingId}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting feedback rating:", error);
    throw error;
  }
}
