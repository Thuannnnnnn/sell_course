import axios from "axios";

export const createPaymentLinkAPI = async (
  paymentData: {
    courseId: string;
    email: string;
    promotionCode?: string;
    userId?: string;
    amount?: number;
  },
  accessToken?: string
): Promise<{
  qrCode: string;
  checkoutUrl: string;
  orderCode: string;
  promotionDetails?: {
    id: string;
    name: string;
    discount: number;
    discountAmount: number;
    originalPrice: number;
    finalPrice: number;
  };
}> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/create-payment-link`,
      paymentData,
      {
        headers,
      }
    );

    return response.data;
  } catch {
    throw new Error("Failed to create payment link");
  }
};

export const checkPaymentStatusAPI = async (
  orderCode: string
): Promise<{
  paymentStatus: string;
}> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/check-payment-status`,
      {
        params: { orderCode },
      }
    );

    return response.data;
  } catch {
    throw new Error("Failed to check payment status");
  }
};
