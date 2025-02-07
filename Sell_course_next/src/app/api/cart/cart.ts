import axios from "axios";
import { response}
export function addToCart(
  token: string,
  user_id: string,
  course_id: string
): Promise<response> {
  return axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
      token,
      user_id,
      course_id,
    })
    .then((res) => {
      return {
        statusCode: res.status,
        message: res.data.message,
      };
    })
    .catch((error) => {
      return {
        statusCode: error.response.status,
        message: error.message,
      };
    });
}
