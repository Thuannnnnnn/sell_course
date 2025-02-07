import axios from "axios";
import { response, CartResponse } from "@/app/type/cart/cart";
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
export async function fetchCart(
  token: string,
  user_id: string
): Promise<CartResponse> {
  return axios
    .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      return {
        cart_id: res.data.cart_id,
        course_id: res.data.course_id,
        user_id: res.data.user_id,
        user_name: res.data.user_name,
        course_title: res.data.course_title,
        course_price: res.data.course_price,
        course_img: res.data.course_img,
      };
    })
    .catch((error) => {
      throw new Error(error.message);
    });
}
