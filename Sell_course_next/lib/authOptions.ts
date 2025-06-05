import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback/oauth`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                picture: user.image,
              }),
            }
          );
          const data = await response.json();
          if (response.ok) {
            user.token = data.token;
            user.id = data.user_id;
            user.avatarImg = data.avatarImg;
            user.gender = data.gender;
            user.birthDay = data.birthDay;
            user.phoneNumber = data.phoneNumber;
            user.role = data.role;
            return true;
          }
          throw new Error(data.message || "Google login failed");
        } catch (error) {
          console.error("Error in Google signIn:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
        token.avatarImg = user.avatarImg;
        token.gender = user.gender;
        token.birthDay = user.birthDay;
        token.phoneNumber = user.phoneNumber;
        token.role = user.role;
      }
      if (account) {
        token.exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
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
