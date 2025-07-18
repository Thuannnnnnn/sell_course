// User Types for Frontend
export interface Permission {
  id: number;
  name: string;
  code: string;
}

export interface User {
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

export interface UserWithPermissions {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string;
  birthDay: string | null;
  phoneNumber: string;
  role: string;
  isBan: boolean;
  permissions: Permission[];
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  gender?: string;
  avatarImg?: string;
  birthDay?: string;
  phoneNumber?: string;
  role?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AssignPermissionsData {
  permissionIds: number[];
}

export interface BanUserData {
  isBan: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface UserProfileResponse {
  status: number;
  message: string;
  data: User;
}

export interface BanUserResponse {
  message: string;
  user: User;
}

export interface RemovePermissionResponse {
  message: string;
  user: UserWithPermissions;
}