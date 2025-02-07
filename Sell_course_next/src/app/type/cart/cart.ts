export interface response {
  statusCode: number;
  message: string;
}

export interface CartResponse {
  cart_id: string;
  course_id: string;
  user_id: string;
  course_name: string;
  user_name: string;
  course_title: string;
  course_price: number;
}
