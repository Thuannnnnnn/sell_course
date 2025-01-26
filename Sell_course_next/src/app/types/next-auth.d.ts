import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    token: string;
    id: string;
    email: string;
    role: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
    expires: string;
    error: string;
  }
}
