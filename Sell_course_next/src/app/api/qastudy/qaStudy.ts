import { QaData, ReactionQa } from '@/app/type/qastudy/QAStudy';

// Base URL từ biến môi trường
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Các hàm HTTP API

/** Lấy tất cả QA của một khóa học */
export async function getAllQaStudy(
  token: string,
  courseId: string
): Promise<QaData[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa_study/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching QaStudy data:', error);
    throw error;
  }
}

/** Tạo một QA mới hoặc trả lời QA khác */
export async function createQaStudy(
  token: string,
  userEmail: string,
  courseId: string,
  text: string,
  parentId?: string
): Promise<QaData> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa_study`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail, courseId, text, parentId }),
    });

    if (!response.ok) throw new Error(`Failed to create QaStudy: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating QaStudy:', error);
    throw error;
  }
}


export async function updateQaStudy(
  token: string,
  qaId: string,
  text: string
): Promise<QaData> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa_study/${qaId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`Failed to update QaStudy: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating QaStudy:', error);
    throw error;
  }
}

/** Xóa một QA */
export async function deleteQaStudy(token: string, qaId: string): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa_study/${qaId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Failed to delete QaStudy: ${response.status}`);
  } catch (error) {
    console.error('Error deleting QaStudy:', error);
    throw error;
  }
}

/** Thêm hoặc cập nhật reaction cho một QA */
export async function createReactionQa(
  token: string,
  userId: string,
  qaStudyId: string,
  reactionType: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
): Promise<ReactionQa> {
  try {
    const response = await fetch(`${BACKEND_URL}/reaction-qa`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, qaStudyId, reactionType }),
    });

    if (!response.ok) throw new Error(`Failed to create reaction: ${response.status}`);
    const reaction = await response.json();
    return {
      userEmail: reaction.user.email,
      reactionType: reaction.reactionType,
    };
  } catch (error) {
    console.error('Error creating reaction:', error);
    throw error;
  }
}

/** Lấy tất cả reactions của một QA */
export async function getReactionsByQa(
  token: string,
  qaStudyId: string
): Promise<ReactionQa[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/reaction-qa/${qaStudyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Failed to get reactions: ${response.status}`);
    const reactions = await response.json();
    return reactions.map((reaction: any) => ({
      userEmail: reaction.user.email,
      reactionType: reaction.reactionType,
    }));
  } catch (error) {
    console.error('Error fetching reactions:', error);
    throw error;
  }
}



