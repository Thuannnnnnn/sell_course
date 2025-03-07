import axios from "axios";

export const fetchOrderHistory = async (token: string, email: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/by_email/${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Order history:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    return null;
  }
};

