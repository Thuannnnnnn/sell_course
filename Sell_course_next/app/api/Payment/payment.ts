import axios from "axios";
export const createPaymentLinkAPI = async (paymentData: {
  amount: number;
  description: string;
  items: Array<{ courseId: string; name: string; price: number }>;
  email: string;
  lang: string;
}): Promise<{ paymentLink: string }> => {
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
    throw new Error("An unexpected error occurred");
  }
};
