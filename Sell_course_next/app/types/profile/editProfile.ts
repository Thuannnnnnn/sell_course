export interface UserProfile {
  user_id: string;
  email: string;
  username: string;
  avatarImg: string | null;
  gender: string | null;
  birthDay: string | null;
  phoneNumber: string | null;
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
  phoneNumber?: string;
}

export interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  token: string;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}