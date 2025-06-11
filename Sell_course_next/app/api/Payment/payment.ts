import axios from "axios";

export const createPaymentLinkAPI = async (paymentData: {
  courseId: string;
  email: string;
}): Promise<{
  qrCode: string;
  checkoutUrl: string;
  orderCode: string;
}> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/create-payment-link`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
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
