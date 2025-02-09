import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    token: string;
    user_id: string;
    id: string;
    email: string;
    role: string;
    gender: string;
    birthDay: string;
    avatarImg: string;
    phoneNumber: string;
    username: string;
  }

  interface Session {
    user_id: string;
    avatarImg: string;
    user: User & DefaultSession["user"];
    expires: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    avatarImg: string;
    email: string;
    user_id: string;
    role: string;
    token: string;
    username: string;
  }
}
