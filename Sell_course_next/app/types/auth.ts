// types/auth.ts (relevant excerpt)
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarImg?: string;
  gender?: string;
  birthDay?: string;
  phoneNumber?: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface CustomSession {
  user: SessionUser;
  accessToken: string;
}
