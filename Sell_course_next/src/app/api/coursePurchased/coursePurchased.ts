import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/course_purchased";

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
    const response = await axiosInstance.get(`/${courseId}/${email}`);
    if (response.data.code === 404) {
      return 404;
    }
    return 200;
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
