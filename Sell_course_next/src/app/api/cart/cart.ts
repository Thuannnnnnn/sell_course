import axios from "axios";
import { response, CartResponse } from "@/app/type/cart/cart";
export function addToCart(
  token: string,
  email: string,
  course_id: string
): Promise<response> {
  console.log(token, email, course_id);
  return axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
      token,
      email,
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
  email: string
): Promise<CartResponse[]> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${email}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid cart response format");
    }

    return response.data.map((item) => ({
      cart_id: item.cart_id,
      course_id: item.course_id,
      user_id: item.user_id,
      user_name: item.user_name,
      course_title: item.course_title,
      course_price: item.course_price,
      course_img: item.course_img,
    }));
  } catch {
    throw new Error(`Failed to fetch cart`);
  }
}

export async function deleteCart(
  token: string,
  email: string,
  courseId: string
): Promise<response> {
  try {
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          token,
          email,
          courseId,
        },
      }
    );
    return {
      statusCode: res.status,
      message: res.data.message,
    };
  } catch {
    return {
      statusCode: 500,
      message: "fail to load",
    };
  }
}
