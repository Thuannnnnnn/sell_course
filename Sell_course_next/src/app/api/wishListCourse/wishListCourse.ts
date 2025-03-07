import axios from "axios";

export const createWishListCourse = async (userId: string, courseId: string) => {
    // console.log("Token:", token);
    console.log("User ID:", userId);
    console.log("Course ID:", courseId);
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/add`,
      { userId, courseId },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    );
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error creating wish list course:", error.response.status, error.response.data);
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
};

export const fetchWishListCourse = async (userId: string) => {
    console.log("User ID:", userId);
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/${userId}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    );
    const data = await response.data;
    console.log("API Response:", data); // Debug dữ liệu từ API
    return data;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export const deleteWishListCourse = async (userId: string, courseId: string) => {
    console.log("User ID:", userId);
    console.log("WishList ID:", courseId);
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/${courseId}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    );
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error deleting wish list course:", error.response.status, error.response.data);
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
    }
}