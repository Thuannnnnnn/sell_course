export interface PromotionValidationResponse {
  id: string;
  name: string;
  code: string;
  discount: number;
  status: 'active' | 'expired' | 'pending';
  isExpired: boolean;
  isPending: boolean;
  course?: {
    courseId: string;
    title: string;
    price: number;
  };
}

export const validatePromotionCode = async (
  code: string,
  courseId?: string,
  token?: string
): Promise<PromotionValidationResponse> => {
  const url = courseId
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/promotion/validate/${code}?courseId=${courseId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/promotion/validate/${code}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to validate promotion code');
  }

  return response.json();
}; 