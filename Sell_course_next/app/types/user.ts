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

export interface UserProfile {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string | null;
  birthDay: string | null;
  phoneNumber: number | null;
  isOAuth: boolean;
  role: string;
  isBan: boolean;
  createdAt?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatarImg?: string;
  gender?: string;
  birthDay?: string;
  phoneNumber?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
