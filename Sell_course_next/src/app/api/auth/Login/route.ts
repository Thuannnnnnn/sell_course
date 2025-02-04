import axios from "axios";

export async function loginUser(email: string, password: string) {
  console.log("loginUser was called with email and password:", email, password);
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`;
    console.log("API URL:", url);

    const response = await axios.post(
      url,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Received response from backend:", response);

    const data = response.data;
    console.log("Parsed JSON data:", data);

    return data;
  } catch (error) {
    console.error("Error in loginUser:", error);

    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed API: ${error.response?.data?.message || error.message}`
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

export default loginUser;
