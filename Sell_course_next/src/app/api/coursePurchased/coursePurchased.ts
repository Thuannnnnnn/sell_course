import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export class CoursePurchaseAPI {
  static async getAllCoursePurchases() {
    try {
      const response = await axiosInstance.get('/api/course_purchased/');
      return response.data;
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
      throw error;
    }
  }

  static async getCoursePurchaseById(courseId: string, email: string) {
    const response = await axiosInstance.get(
      `/api/course_purchased/${courseId}/${email}`
    );
    if (response.data.code === 404) {
      return 404;
    }
    return 200;
  }

  static async createCoursePurchase(email: string, courseIds: string[]) {
    try {
      const response = await axiosInstance.post(
        '/api/course_purchased/create',
        {
          email,
          courseIds,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating course purchase:', error);
      throw error;
    }
  }
}
