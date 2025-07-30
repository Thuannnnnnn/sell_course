import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { refreshAccessToken, isTokenExpired } from "./utils/refreshToken";

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
              refreshToken: data.refreshToken,
              avatarImg: data.avatarImg,
              gender: data.gender,
              birthDay: data.birthDay,
              phoneNumber: data.phoneNumber,
              role: data.role,
            };
          }
          return null;
        } catch (error) {
          // Nếu bị ban hoặc lỗi backend trả về message, truyền message lên FE
          if (axios.isAxiosError(error) && error.response) {
            const message = error.response.data?.message || 'Login failed';
            throw new Error(message);
          }
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
            user.refreshToken = data.refreshToken;
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
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
        token.refreshToken = user.refreshToken;
        token.avatarImg = user.avatarImg;
        token.gender = user.gender;
        token.birthDay = user.birthDay;
        token.phoneNumber = user.phoneNumber;
        token.role = user.role;
        // Set access token expiration (2 hours from now)
        token.accessTokenExpires = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
      }

      // Return previous token if the access token has not expired yet
      if (!isTokenExpired(token.accessTokenExpires || 0)) {
        return token;
      }

      // Access token has expired, try to update it
      if (token.refreshToken) {
        try {
          const refreshedTokens = await refreshAccessToken(token.refreshToken);
          
          if (refreshedTokens) {
            return {
              ...token,
              accessToken: refreshedTokens.token,
              refreshToken: refreshedTokens.refreshToken,
              accessTokenExpires: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
              error: undefined,
            };
          } else {
            // Refresh token is invalid or expired
            return {
              ...token,
              error: "RefreshAccessTokenError",
            };
          }
        } catch (error) {
          console.error("Error refreshing access token:", error);
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }

      // If we don't have a refresh token, return the current token
      if (account) {
        token.exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.avatarImg = token.avatarImg;
      session.user.gender = token.gender;
      session.user.birthDay = token.birthDay;
      session.user.phoneNumber = token.phoneNumber;
      session.user.role = token.role;
      session.expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      
      // If there's an error with token refresh, we can handle it here
      if (token.error) {
        // You might want to force sign out or show an error message
        console.error("Token refresh error:", token.error);
      }
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/error",
  },
};
