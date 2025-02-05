import axios from "axios";

interface ApiResponse {
  statusCode: number;
  message: string;
}

export async function sendMail(
  email: string,
  lang: string
): Promise<ApiResponse | false> {
  try {
    const response = await axios.post<ApiResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-verify-email`,
      {
        email: email,
        lang: lang,
      }
    );

    return response.data;
  } catch {
    return false;
  }
}
