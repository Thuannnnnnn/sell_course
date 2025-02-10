import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api/course_purchased";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export class CoursePurchaseAPI {
  static async getAllCoursePurchases() {
    try {
      const response = await axiosInstance.get("/");
      return response.data;
    } catch (error) {
      console.error("Error fetching purchased courses:", error);
      throw error;
    }
  }

  static async getCoursePurchaseById(courseId: string, email: string) {
    try {
      const response = await axiosInstance.post(`/${courseId}`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error fetching course purchase for ${courseId}:`, error);
      throw error;
    }
  }

  static async createCoursePurchase(email: string, courseIds: string[]) {
    try {
      const response = await axiosInstance.post("/create", {
        email,
        courseIds,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating course purchase:", error);
      throw error;
    }
  }
}
