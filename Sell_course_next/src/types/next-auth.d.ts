import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    token: string;
    id: string;
    email: string;
    role: string;
    gender: string;
    birthDay: string;
    phoneNumber: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
    token: string;
  }
}
