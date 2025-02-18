import axios from 'axios';
import { PaymentResponse } from '@/app/type/payment/payment';
export interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  items: PaymentItem[];
  lang: string;
}

export async function payment(
  paymentData: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/create-payment-link`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment API error:', error);
    throw error;
  }
}
export async function addCoursePurchased(
  token: string,
  email: string,
  courseIds: string[]
) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/course_purchased/create`,
      {
        email: email,
        courseIds: courseIds,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm khóa học đã mua:', error);
    throw error;
  }
}
