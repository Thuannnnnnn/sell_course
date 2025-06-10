export interface UserResponse {
  user_id: string;
  email: string;
  username: string;
  phoneNumber?: number;
  avatarImg?: string;
  gender?: string;
  birthDay?: string;
  role: string;
  createdAt: string;
}
