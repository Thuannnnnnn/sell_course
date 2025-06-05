import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );
          const data = response.data;
          if (data) {
            return {
              id: data.user_id,
              email: data.email,
              name: data.username,
              token: data.token,
              avatarImg: data.avatarImg,
              gender: data.gender,
              birthDay: data.birthDay,
              phoneNumber: data.phoneNumber,
              role: data.role,
            };
          }
          return null;
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
        token.avatarImg = user.avatarImg;
        token.gender = user.gender;
        token.birthDay = user.birthDay;
        token.phoneNumber = user.phoneNumber;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      session.user.avatarImg = token.avatarImg;
      session.user.gender = token.gender;
      session.user.birthDay = token.birthDay;
      session.user.phoneNumber = token.phoneNumber;
      session.user.role = token.role;
      session.expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/error",
  },
};
