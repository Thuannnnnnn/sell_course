import axios from 'axios';
import { CourseData } from '@/app/type/course/Lesson';

export async function fetchLesson(
  courseId: string,
  token: string
): Promise<CourseData | null> {
  try {
    const response = await axios.get<CourseData>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/lesson/view_lesson/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}
