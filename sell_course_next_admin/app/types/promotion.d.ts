export interface Promotion {
  id: string;
  name: string;
  discount: number;
  code: string;
  courseId: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'expired' | 'pending';
  isExpired?: boolean;
  isPending?: boolean;
  course?: {
    courseId: string;
    title: string;
    price: number;
  };
}

export interface CreatePromotionDto {
  name: string;
  discount: number;
  code: string;
  courseId: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePromotionDto {
  name?: string;
  discount?: number;
  code?: string;
  courseId?: string;
  startDate?: string;
  endDate?: string;
} 