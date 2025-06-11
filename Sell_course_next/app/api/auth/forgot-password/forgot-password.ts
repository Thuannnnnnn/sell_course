import axios from "axios";

export const forgotPasswordAPI = async (
  email: string
): Promise<{ message: string; statusCode: number }> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-verify-email`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch {
    throw new Error("An unexpected error occurred");
  }
};

export const verifyOtp = async (
  email: string,
  otp_code: string
): Promise<Response & { verified: boolean }> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp-reset-pw`,
      {
        email,
        otp_code,
        purpose: "password_reset",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch {
    throw new Error("An unexpected error occurred");
  }
};

export const resetPasswordAPI = async (
  email: string,
  new_password: string,
  otp_code: string
): Promise<{ message: string; statusCode: number }> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password-with-otp`,
      { email, new_password, otp_code },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch {
    throw new Error("An unexpected error occurred");
  }
};
