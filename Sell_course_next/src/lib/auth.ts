import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios, { AxiosError } from "axios";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          console.error("Missing credentials");
          return null;
        }
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data?.token) {
            return {
              token: response.data.token,
              id: response.data.id,
              email: response.data.email,
              gender: response.data.gender,
              birthDay: response.data.birthDay,
              avartaImg: response.data.avartaImg,
              phoneNumber: response.data.phoneNumber,
              name: response.data.username,
              role: response.data.role,
            };
          } else {
            console.error("Login failed:", response.data.message || "Unknown error");
            return null;
          }
        } catch (error) {
          const err = error as AxiosError;
          console.error("Error in authorize function:", err.response?.data || err.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.token = user.token;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.gender = user.gender;
        token.avartaImg = user.avartaImg;
        token.birthDay = user.birthDay;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.token = token.token;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.avartaImg = token.avartaImg;
      session.user.name = token.name;
      session.user.role = token.role;
      session.user.gender = token.gender;
      session.user.birthDay = token.birthDay;
      session.user.phoneNumber = token.phoneNumber;
      return session;
    },
    async signIn({ user, account }) {
      console.log("SignIn callback initiated with user and account:", { user, account });

      if (!user || !account) {
        console.error("Error: User or account is null");
        return false;
      }

      if (account.type === "credentials") {
        const payload = {
          token: (user as any).token,
          provider: account.provider,
          id: user.id,
          email: user.email,
          name: user.name,
          avartaImg: user.avartaImg || "/default-avatar.svg",
        };
        console.log("Payload prepared for API call:", payload);
        return true;
      }


      const payload = {
        token: (user as any).token,
        email: user.email,
        name: user.name,
        avartaImg: user.avartaImg,
      };
      console.log("Payload prepared for API call:", payload);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/oauth`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("API response received:", response.data);

        if (!response.data) {
          console.error("Error: API response data is null");
          return false;
        }

        console.log("Sign-in successful, response from backend:", response.data);
        return true;
      } catch (error) {
        console.error("Error during API call in sign-in callback:", error);
        return false;
      }
    },
  },
});