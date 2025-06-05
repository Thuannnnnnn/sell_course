export interface ApiResponse {
  message: string;
  statusCode: number;
}

export interface RegisterData {
  email: string;
  otp_code: string;
  username: string;
  password: string;
  avatarImg?: string;
  gender?: string;
  birthDay?: string;
  phoneNumber?: number;
}

