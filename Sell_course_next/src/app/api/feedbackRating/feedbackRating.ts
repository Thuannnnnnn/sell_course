import axios from "axios";
import { ResponseFeedbackRatingDto } from "@/app/type/feedbackRating/feedbackRating";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Get all feedback ratings
export async function getAllFeedbackRatings(): Promise<ResponseFeedbackRatingDto[]> {
  try {
    const response = await axios.get<ResponseFeedbackRatingDto[]>(
      `${BACKEND_URL}/feedback-ratting`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback ratings:", error);
    throw error;
  }
}

// Get feedback rating by course ID
export async function getFeedbackRatingByCourseId(
  courseId: string
): Promise<ResponseFeedbackRatingDto[]> {
  try {
    if (!courseId) {
      console.warn("Course ID is undefined or empty");
      return [];
    }
    
    const response = await axios.get<ResponseFeedbackRatingDto[]>(
      `${BACKEND_URL}/feedback-ratting/${courseId}`
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error(`Error fetching feedback ratings for course ${courseId}:`, error);
    return [];
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
    if (!userId || !courseId) {
      throw new Error("User ID and Course ID are required");
    }
    
    const response = await axios.post<ResponseFeedbackRatingDto>(
      `${BACKEND_URL}/feedback-ratting`,
      { user_id: userId, courseId, star, feedback },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
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
    if (!feedbackRatingId) {
      throw new Error("Feedback Rating ID is required");
    }
    
    const response = await axios.put<ResponseFeedbackRatingDto>(
      `${BACKEND_URL}/feedback-ratting/${feedbackRatingId}`,
      { star, feedback },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating feedback rating:", error);
    throw error;
  }
}

// Delete a feedback rating
export async function deleteFeedbackRating(
  feedbackRatingId: string,
  token?: string
): Promise<void> {
  try {
    if (!feedbackRatingId) {
      throw new Error("Feedback Rating ID is required");
    }
    
    await axios.delete(`${BACKEND_URL}/feedback-ratting/${feedbackRatingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error deleting feedback rating:", error);
    throw error;
  }
}